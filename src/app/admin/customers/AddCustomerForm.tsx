"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddCustomerForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await fetch("/api/admin/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        phone: formData.get("phone"),
        bizNo: formData.get("bizNo"),
        memo: formData.get("memo") || undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "저장에 실패했습니다.");
      return;
    }
    router.refresh();
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
      <h2 className="font-semibold text-gray-900">고객 등록</h2>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm text-gray-700 mb-1">대표자명</label>
          <input id="name" name="name" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm text-gray-700 mb-1">휴대폰</label>
          <input id="phone" name="phone" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label htmlFor="bizNo" className="block text-sm text-gray-700 mb-1">사업자번호</label>
          <input id="bizNo" name="bizNo" required className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="000-00-00000" />
        </div>
        <div>
          <label htmlFor="memo" className="block text-sm text-gray-700 mb-1">메모</label>
          <input id="memo" name="memo" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
      </div>
      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
        등록
      </button>
    </form>
  );
}
