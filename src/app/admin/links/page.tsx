import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const STATUS_LABELS: Record<string, string> = {
  sent: "발송됨",
  opened: "열람함",
  hometax_clicked: "홈택스 이동",
  customer_completed: "고객 완료",
  office_confirmed: "사무실 확정",
};

export default async function AdminLinksPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const links = await prisma.consentLink.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">링크 / 상태 테이블</h1>
        <Link href="/admin" className="text-gray-600 hover:text-gray-900 text-sm">
          ← 대시보드
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">고객</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">사업자번호</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">만료</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {links.map((link) => (
              <tr key={link.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{link.customer.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{link.customer.bizNo}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="font-medium">{STATUS_LABELS[link.status] ?? link.status}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(link.expiresAt).toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-3 text-sm">
                  <Link href={`/admin/links/${link.id}`} className="text-blue-600 hover:underline">
                    상세
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {links.length === 0 && (
          <p className="px-4 py-8 text-center text-gray-500">발급된 링크가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
