import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import CreateLinkForm from "./CreateLinkForm";

type Props = { params: Promise<{ id: string }> };

export default async function CustomerLinksPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { consentLinks: { orderBy: { createdAt: "desc" } } },
  });
  if (!customer) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://consent.wise-tax.kr";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          링크 생성 — {customer.name}
        </h1>
        <Link href="/admin/customers" className="text-gray-600 hover:text-gray-900 text-sm">
          ← 고객 목록
        </Link>
      </div>

      <CreateLinkForm customerId={customer.id} />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <h2 className="px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">발급된 링크 (1회성)</h2>
        <ul className="divide-y divide-gray-200">
          {customer.consentLinks.map((link) => {
            const fullUrl = `${baseUrl}/consent/${link.id}`;
            return (
              <li key={link.id} className="px-4 py-3 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-700 w-32">{link.status}</span>
                <span className="text-sm text-gray-500">
                  만료: {new Date(link.expiresAt).toLocaleString("ko-KR")}
                </span>
                <Link
                  href={`/admin/links/${link.id}`}
                  className="text-sm text-blue-600 hover:underline ml-auto"
                >
                  상세
                </Link>
              </li>
            );
          })}
        </ul>
        {customer.consentLinks.length === 0 && (
          <p className="px-4 py-8 text-center text-gray-500">아직 발급된 링크가 없습니다. 위에서 링크를 생성하세요.</p>
        )}
      </div>
    </div>
  );
}
