"use client";

import { useState } from "react";
import Link from "next/link";

type BusinessType = "individual" | "corporate" | null;

type Props = {
  token: string;
  linkId: string;
  status: string;
  guideUrl: string;
};

export default function ConsentForm({ token, linkId, status, guideUrl }: Props) {
  const [businessType, setBusinessType] = useState<BusinessType>(null);

  const showGuidance = businessType !== null;
  const showCompleteButton = status === "hometax_clicked" || status === "customer_completed" || status === "office_confirmed";

  return (
    <div className="space-y-6">
      {!showGuidance ? (
        <>
          <p className="text-gray-700">사업자 유형을 선택해 주세요.</p>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="bizType"
                value="individual"
                checked={businessType === "individual"}
                onChange={() => setBusinessType("individual")}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium">개인사업자</span>
            </label>
            <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="bizType"
                value="corporate"
                checked={businessType === "corporate"}
                onChange={() => setBusinessType("corporate")}
                className="w-5 h-5 text-blue-600"
              />
              <span className="font-medium">법인사업자</span>
            </label>
          </div>
        </>
      ) : (
        <>
          {businessType === "individual" && (
            <div className="space-y-4">
              <p className="text-gray-700">모바일에서도 진행 가능합니다.</p>
              <p className="text-gray-700">간편인증(통합인증)으로 진행하실 수 있습니다.</p>
              <Link
                href={guideUrl}
                className="block w-full py-4 px-6 bg-blue-600 text-white text-center font-semibold rounded-xl hover:bg-blue-700 transition"
              >
                홈택스에서 수임동의 진행
              </Link>
            </div>
          )}
          {businessType === "corporate" && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="font-semibold text-amber-800">
                  ⚠ 법인 공동인증서가 필요합니다.
                </p>
                <p className="text-amber-800 mt-1">
                  인증서가 설치된 PC에서 진행해 주세요. 모바일에서는 제한될 수 있습니다.
                </p>
              </div>
              <Link
                href={guideUrl}
                className="block w-full py-4 px-6 bg-blue-600 text-white text-center font-semibold rounded-xl hover:bg-blue-700 transition"
              >
                PC 홈택스로 이동
              </Link>
            </div>
          )}
          <p className="text-sm text-gray-500 text-center">
            <button
              type="button"
              onClick={() => setBusinessType(null)}
              className="underline hover:no-underline"
            >
              사업자 유형 다시 선택
            </button>
          </p>
        </>
      )}

      {showCompleteButton && status !== "office_confirmed" && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-gray-700 mb-3">홈택스에서 수임동의를 완료하셨나요?</p>
          <form action={`/api/consent/complete`} method="POST" className="block">
            <input type="hidden" name="token" value={token} />
            <button
              type="submit"
              className="block w-full py-4 px-6 bg-green-600 text-white text-center font-semibold rounded-xl hover:bg-green-700 transition"
            >
              완료했어요
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
