import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [customersCount, linksCount, pendingCount] = await Promise.all([
    prisma.customer.count(),
    prisma.consentLink.count(),
    prisma.consentLink.count({ where: { status: "customer_completed" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">관리자</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">등록 고객</p>
          <p className="text-2xl font-semibold">{customersCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">발급 링크</p>
          <p className="text-2xl font-semibold">{linksCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">확정 대기</p>
          <p className="text-2xl font-semibold">{pendingCount}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/customers"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          고객 등록
        </Link>
        <Link
          href="/admin/links"
          className="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
        >
          링크/상태 테이블
        </Link>
      </div>
    </div>
  );
}
