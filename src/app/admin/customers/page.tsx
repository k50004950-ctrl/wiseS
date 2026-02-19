import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import AddCustomerForm from "./AddCustomerForm";

export default async function AdminCustomersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { consentLinks: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">고객 목록</h1>
        <Link href="/admin" className="text-gray-600 hover:text-gray-900 text-sm">
          ← 대시보드
        </Link>
      </div>

      <AddCustomerForm />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">대표자명</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">휴대폰</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">사업자번호</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">메모</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">링크</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{c.phone}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{c.bizNo}</td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-[120px] truncate">{c.memo ?? "-"}</td>
                <td className="px-4 py-3 text-sm">
                  <Link href={`/admin/customers/${c.id}/links`} className="text-blue-600 hover:underline">
                    링크 생성 ({c._count.consentLinks})
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="px-4 py-8 text-center text-gray-500">등록된 고객이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
