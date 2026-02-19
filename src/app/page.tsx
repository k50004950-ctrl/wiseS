import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <p className="text-gray-600 mb-4">WISE 수임동의 트래킹</p>
      <Link
        href="/admin"
        className="text-blue-600 hover:underline font-medium"
      >
        관리자 로그인 →
      </Link>
    </div>
  );
}
