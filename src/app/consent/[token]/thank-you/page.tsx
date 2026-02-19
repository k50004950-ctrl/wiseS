type Props = { params: Promise<{ token: string }> };

export default async function ThankYouPage({ params }: Props) {
  const { token: _ } = await params;
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200 py-4 px-4">
        <div className="max-w-lg mx-auto flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="WISE" className="h-10 w-auto" />
        </div>
      </header>
      <main className="flex-1 max-w-lg mx-auto w-full p-6 flex flex-col items-center justify-center text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">수임동의 접수가 완료되었습니다</h1>
        <p className="text-gray-600">
          담당자가 확인 후 최종 확정할 예정입니다. 감사합니다.
        </p>
      </main>
    </div>
  );
}
