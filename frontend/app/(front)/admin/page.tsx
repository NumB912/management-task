"use client";

import { useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ShieldCheck, Users } from "lucide-react";
import { useAdminUsersQuery } from "../feature/hook/useAdminUsersQuery.hook";
import { Button } from "@/components/ui/button";
import { ManageUser } from './manage-user';
import type { AdminUsersPage } from '../model/admin.model';

export default function AdminPage() {
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminUsersPage['users'][number] | null>(null);
  // Access is determined by the protected API, not persisted browser state.
  const query = useAdminUsersQuery(search, page);
  const denied = axios.isAxiosError(query.error) && [401, 403].includes(query.error.response?.status ?? 0);

  if (query.isPending) return <p role="status" className="p-8">Đang xác minh quyền quản trị...</p>;
  if (query.isError) return <div className="p-8 space-y-4">
    <h1 className="text-2xl font-semibold">{denied ? "Không có quyền truy cập" : "Không thể tải trang quản trị"}</h1>
    <p role="alert">{denied ? "Trang này chỉ dành cho tài khoản admin." : "Vui lòng kiểm tra kết nối và thử lại."}</p>
    {!denied && <Button onClick={() => void query.refetch()}>Thử lại</Button>}
    <Link className="block underline" href="/dashboard">Về dashboard</Link>
  </div>;

  const data = query.data;
  return <section className="p-6 md:p-10 space-y-6 max-w-6xl mx-auto">
    <header className="space-y-2"><h1 className="flex items-center gap-3 text-3xl font-bold"><ShieldCheck />Quản trị hệ thống</h1><p className="text-muted-foreground">Quản lý và thống kê tài khoản người dùng.</p></header>
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div className="rounded-xl border p-5"><p className="flex items-center gap-2 text-muted-foreground"><Users size={18} />Tổng tài khoản</p><p className="text-3xl font-semibold mt-2">{data.totalUsers}</p></div>
      <div className="rounded-xl border p-5"><p className="text-muted-foreground">Admin toàn hệ thống</p><p className="text-3xl font-semibold mt-2">{data.admins}</p></div>
      <div className="rounded-xl border p-5"><p className="text-muted-foreground">Người dùng thường</p><p className="text-3xl font-semibold mt-2">{data.regularUsers}</p></div>
      <div className="rounded-xl border p-5"><p className="text-muted-foreground">Tài khoản mới trong 30 ngày</p><p className="text-3xl font-semibold mt-2">{data.newUsersLast30Days}</p></div>
    </div>
    <form className="flex gap-3" onSubmit={e => { e.preventDefault(); setPage(1); setSearch(draft.trim()); }}>
      <input aria-label="Tìm người dùng theo tên hoặc email" placeholder="Tìm theo tên hoặc email..." className="border rounded-md px-3 py-2 flex-1 min-w-0" maxLength={100} value={draft} onChange={e => setDraft(e.target.value)} />
      <Button type="submit">Tìm kiếm</Button>
    </form>
    <div className="overflow-x-auto rounded-xl border"><table className="w-full text-sm text-left"><caption className="sr-only">Danh sách người dùng</caption>
      <thead className="bg-muted"><tr>{["Họ tên", "Email", "Quyền", "Trạng thái", "Ngày tạo", "Thao tác"].map(label => <th key={label} scope="col" className="p-4">{label}</th>)}</tr></thead>
      <tbody>{data.users.map(user => <tr key={user._id} className="border-t"><td className="p-4 font-medium"><button type="button" className="text-primary underline underline-offset-4 cursor-pointer" onClick={() => setSelected(user)} aria-label={`Xem chi tiết ${user.name}`}>{user.name}</button></td><td className="p-4">{user.email}</td><td className="p-4">{user.role === "admin" ? "Admin" : "Người dùng"}</td><td className="p-4"><span className={user.blocked ? "text-destructive" : "text-emerald-600"}>{user.blocked ? "Đã khóa" : "Hoạt động"}</span></td><td className="p-4">{new Date(user.created_at).toLocaleDateString("vi-VN")}</td><td className="p-4"><Button variant="outline" onClick={() => setSelected(user)}>Quản lý</Button></td></tr>)}
      {!data.users.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Không tìm thấy người dùng.</td></tr>}</tbody>
    </table></div>
    {selected && <ManageUser key={selected._id} user={selected} onClose={() => setSelected(null)} />}
    <div className="flex justify-between items-center gap-3"><Button variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Trang trước</Button><span>Trang {page} / {Math.max(1, Math.ceil(data.total / data.pageSize))}</span><Button variant="outline" disabled={page * data.pageSize >= data.total} onClick={() => setPage(p => p + 1)}>Trang sau</Button></div>
  </section>;
}


