"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { adminApi } from "../feature/api/admin/admin.api";
import type { AdminUsersPage } from "../model/admin.model";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog";
import { UserWorkStatistics } from "./user-work-statistics";

export function ManageUser({
  user,
  onClose,
}: {
  user: AdminUsersPage["users"][number];
  onClose: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState(user.role);
  const [blocked, setBlocked] = useState(user.blocked ?? false);
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      adminApi.updateUser(user._id, { name: name.trim(), role, blocked }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    },
  });
  const error =
    axios.isAxiosError(mutation.error) &&
    typeof mutation.error.response?.data?.message === "string"
      ? mutation.error.response.data.message
      : "Không thể cập nhật người dùng. Vui lòng thử lại.";
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
    >
      <DialogContent
        className="sm:max-w-3xl max-h-[90dvh] overflow-y-auto"
        aria-describedby="manage-user-email"
      >
        <DialogTitle className="text-xl font-semibold">
          Quản lý người dùng
        </DialogTitle>
        <p id="manage-user-email" className="text-muted-foreground break-all">
          {user.email}
        </p>
        <UserWorkStatistics userId={user._id} />
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          <fieldset disabled={mutation.isPending} className="space-y-4">
            <label className="grid gap-2">
              Họ tên
              <input
                className="border rounded-md p-2"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="grid gap-2">
              Quyền
              <select
                className="border rounded-md p-2 bg-background"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">Người dùng</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={blocked}
                onChange={(e) => setBlocked(e.target.checked)}
              />
              Khóa tài khoản
            </label>
            <p className="text-sm text-muted-foreground">
              Tài khoản bị khóa sẽ không thể tiếp tục sử dụng hệ thống. Không
              thể khóa hoặc hạ quyền tài khoản admin.
            </p>
          </fieldset>
          {mutation.isError && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={mutation.isPending || !name.trim()}>
              {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
