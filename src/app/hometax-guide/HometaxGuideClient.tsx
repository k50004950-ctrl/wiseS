"use client";

type Props = { token: string; hometaxUrl: string };

export default function HometaxGuideClient({ token, hometaxUrl }: Props) {
  return (
    <div className="space-y-4">
      <a
        href={hometaxUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full py-4 px-6 bg-blue-600 text-white text-center font-semibold rounded-xl hover:bg-blue-700 transition"
      >
        홈택스(국세청) 열기
      </a>
      <div className="pt-6 border-t border-gray-200">
        <p className="text-gray-700 mb-3">홈택스에서 수임동의를 완료하셨나요?</p>
        <form action="/api/consent/complete" method="POST" className="block">
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="block w-full py-4 px-6 bg-green-600 text-white text-center font-semibold rounded-xl hover:bg-green-700 transition"
          >
            완료했어요
          </button>
        </form>
      </div>
    </div>
  );
}
