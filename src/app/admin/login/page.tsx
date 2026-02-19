import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminLoginForm from "./AdminLoginForm";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <div className="max-w-sm mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">관리자 로그인</h1>
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
        <p className="font-medium mb-1">로그인이 안 되나요?</p>
        <p className="mb-1">1) 개발 서버를 끄고 (Ctrl+C)</p>
        <p className="mb-2">2) 새 터미널에서 실행:</p>
        <code className="block bg-amber-100 p-2 rounded text-xs break-all">cd c:\wise</code>
        <code className="block bg-amber-100 p-2 rounded text-xs break-all mt-1">npm run setup</code>
        <p className="mt-2 text-amber-700">기본 계정: <strong>admin@wise-tax.kr</strong> / <strong>admin123!</strong></p>
      </div>
      <AdminLoginForm />
    </div>
  );
}
