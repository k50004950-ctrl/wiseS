import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ConfirmButton from "./ConfirmButton";

const STATUS_LABELS: Record<string, string> = {
  sent: "발송됨",
  opened: "열람함",
  hometax_clicked: "홈택스 이동",
  customer_completed: "고객 완료",
  office_confirmed: "사무실 확정",
};

type Props = { params: Promise<{ id: string }> };

export default async function AdminLinkDetailPage({ params }: Props) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const link = await prisma.consentLink.findUnique({
    where: { id },
    include: { customer: true },
  });
  if (!link) notFound();

  const canConfirm = link.status === "customer_completed";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">수임동의 상세</h1>
        <Link href="/admin/links" className="text-gray-600 hover:text-gray-900 text-sm">
          ← 목록
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div>
          <span className="text-sm text-gray-500">고객</span>
          <p className="font-medium">{link.customer.name}</p>
          <p className="text-sm text-gray-600">{link.customer.phone} · {link.customer.bizNo}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">상태</span>
          <p className="font-medium">{STATUS_LABELS[link.status] ?? link.status}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500">만료</span>
          <p className="text-sm">{new Date(link.expiresAt).toLocaleString("ko-KR")}</p>
        </div>
        {link.openedAt && (
          <div>
            <span className="text-sm text-gray-500">열람 시각</span>
            <p className="text-sm">{new Date(link.openedAt).toLocaleString("ko-KR")}</p>
          </div>
        )}
        {link.customerCompletedAt && (
          <div>
            <span className="text-sm text-gray-500">고객 완료 시각</span>
            <p className="text-sm">{new Date(link.customerCompletedAt).toLocaleString("ko-KR")}</p>
          </div>
        )}
        {link.officeConfirmedAt && (
          <div>
            <span className="text-sm text-gray-500">사무실 확정 시각</span>
            <p className="text-sm">{new Date(link.officeConfirmedAt).toLocaleString("ko-KR")}</p>
          </div>
        )}

        {canConfirm && (
          <div className="pt-4 border-t border-gray-200">
            <ConfirmButton linkId={link.id} />
          </div>
        )}
      </div>
    </div>
  );
}
