import { redirect } from "next/navigation";
import Link from "next/link";
import {
  findConsentByToken,
  markHometaxClicked,
  isLinkExpired,
  isLinkConsumed,
} from "@/lib/consent";
import HometaxGuideClient from "./HometaxGuideClient";

const HOMETAX_CONSENT_URL = "https://hometax.go.kr";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function HometaxGuidePage({ searchParams }: Props) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <p className="text-gray-600">유효한 링크가 아닙니다.</p>
        <Link href="/" className="mt-4 text-blue-600 underline">처음으로</Link>
      </div>
    );
  }

  const link = await findConsentByToken(token);
  if (!link || isLinkExpired(link.expiresAt) || isLinkConsumed(link.status as "office_confirmed")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <p className="text-gray-600">만료되었거나 사용할 수 없는 링크입니다.</p>
        <Link href="/" className="mt-4 text-blue-600 underline">처음으로</Link>
      </div>
    );
  }

  if (link.status === "opened") {
    await markHometaxClicked(link.id);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 py-4 px-4">
        <div className="max-w-lg mx-auto flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="WISE" className="h-10 w-auto" />
        </div>
      </header>
      <main className="flex-1 max-w-lg mx-auto w-full p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">홈택스 수임동의 진행 안내</h1>
        <div className="space-y-4 text-gray-700 mb-8">
          <p>아래 버튼을 눌러 홈택스(국세청) 사이트로 이동한 뒤, 수임동의 절차를 진행해 주세요.</p>
          <p className="text-sm text-gray-500">
            로그인 후 &quot;세무대리인 수임동의&quot; 메뉴에서 진행하시면 됩니다.
          </p>
        </div>
        <HometaxGuideClient
          token={token}
          hometaxUrl={HOMETAX_CONSENT_URL}
        />
      </main>
    </div>
  );
}
