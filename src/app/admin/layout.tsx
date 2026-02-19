import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  const isLoginPage = false; // we'll check in each page

  return (
    <div className="min-h-screen bg-gray-50">
      {session && (
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/admin" className="font-semibold text-gray-800">
              WISE 수임동의 관리
            </Link>
            <form action="/api/admin/logout" method="POST">
              <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                로그아웃
              </button>
            </form>
          </div>
        </header>
      )}
      <main className="max-w-4xl mx-auto p-4">{children}</main>
    </div>
  );
}
