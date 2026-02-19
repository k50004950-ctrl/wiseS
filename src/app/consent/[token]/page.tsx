import { headers } from "next/headers";
import {
  findConsentByToken,
  markOpened,
  isLinkExpired,
  isLinkConsumed,
} from "@/lib/consent";
import { rateLimit, getClientKey } from "@/lib/rate-limit";
import ConsentForm from "./ConsentForm";

const HOMETAX_GUIDE_PATH = "/hometax-guide";

type Props = { params: Promise<{ token: string }> };

export default async function ConsentPage({ params }: Props) {
  const { token } = await params;
  const key = getClientKey(await headers());
  const { ok: rateOk } = rateLimit(`consent:${key}`);
  if (!rateOk) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <p className="text-gray-600">요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.</p>
      </div>
    );
  }

  const link = await findConsentByToken(token);

  if (!link) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">링크를 찾을 수 없습니다</h1>
          <p className="text-gray-600">
            링크가 잘못되었거나 만료되었을 수 있습니다. 세무사무실에 문의해 주세요.
          </p>
        </div>
      </div>
    );
  }

  if (isLinkExpired(link.expiresAt)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">만료된 링크입니다</h1>
          <p className="text-gray-600">
            수임동의 링크는 발급 후 72시간 동안만 유효합니다. 새 링크가 필요하면 세무사무실에 문의해 주세요.
          </p>
        </div>
      </div>
    );
  }

  if (isLinkConsumed(link.status as "office_confirmed")) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-gray-800 mb-2">이미 처리된 링크입니다</h1>
          <p className="text-gray-600">이 수임동의는 이미 완료 처리되었습니다.</p>
        </div>
      </div>
    );
  }

  if (link.status === "sent") {
    await markOpened(link.id);
  }

  const guideUrl = `${HOMETAX_GUIDE_PATH}?token=${encodeURIComponent(token)}`;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 py-4 px-4">
        <div className="max-w-lg mx-auto flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="WISE" className="h-10 w-auto" />
        </div>
      </header>
      <main className="flex-1 max-w-lg mx-auto w-full p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">수임동의 안내</h1>
        <ConsentForm token={token} linkId={link.id} status={link.status} guideUrl={guideUrl} />
      </main>
    </div>
  );
}
