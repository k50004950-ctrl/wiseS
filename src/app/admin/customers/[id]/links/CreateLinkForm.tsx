"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { customerId: string };

export default function CreateLinkForm({ customerId }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCreatedUrl(null);
    const res = await fetch("/api/admin/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customerId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "링크 생성에 실패했습니다.");
      return;
    }
    setCreatedUrl(data.fullUrl);
    router.refresh();
  }

  async function copyUrl() {
    if (!createdUrl) return;
    await navigator.clipboard.writeText(createdUrl);
    alert("링크가 클립보드에 복사되었습니다.");
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
      <h2 className="font-semibold text-gray-900">수임동의 링크 생성 (1회성, 72시간)</h2>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}
      {createdUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium text-green-800">링크가 생성되었습니다. 아래 URL을 고객에게 전달하세요. (한 번만 표시됩니다)</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={createdUrl}
              className="flex-1 px-3 py-2 text-sm border border-green-300 rounded bg-white"
            />
            <button
              type="button"
              onClick={copyUrl}
              className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              복사
            </button>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="customerId" value={customerId} />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          링크 생성
        </button>
      </form>
    </div>
  );
}
