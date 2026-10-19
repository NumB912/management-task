"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminApi } from "../feature/api/admin/admin.api";
import { Button } from "@/components/ui/button";

export function UserWorkStatistics({ userId }: { userId: string }) {
  const [days, setDays] = useState(30);
  const query = useQuery({
    queryKey: ["admin-user-work-statistics", userId, days],
    queryFn: () => adminApi.getUserWorkStatistics(userId, days),
    retry: false,
  });
  const data = query.data;
  return (
    <section className="space-y-4 border-b pb-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-semibold">Thống kê danh sách và task</h2>
        <select
          aria-label="Khoảng thời gian hoàn thành task"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="border rounded-md bg-background px-3 py-2 text-sm"
        >
          {[7, 30, 90].map((value) => (
            <option key={value} value={value}>
              {value} ngày gần nhất
            </option>
          ))}
        </select>
      </div>
      {query.isPending && (
        <p role="status" className="text-sm text-muted-foreground">
          Đang tải thống kê...
        </p>
      )}
      {query.isError && (
        <div role="alert" className="flex items-center gap-3 text-sm">
          Không thể tải thống kê.{" "}
          <Button variant="outline" onClick={() => void query.refetch()}>
            Thử lại
          </Button>
        </div>
      )}
      {data && (
        <>
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ["Danh sách sở hữu", data.totalLists.toLocaleString("vi-VN")],
              ["Tổng task", data.totalTasks.toLocaleString("vi-VN")],
              [
                `Hoàn thành trong ${data.days} ngày`,
                data.completedTasks.toLocaleString("vi-VN"),
              ],
              [
                "Trung bình task/ngày",
                data.averageCompletedPerDay.toLocaleString("vi-VN", {
                  maximumFractionDigits: 2,
                }),
              ],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border bg-muted/30 p-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-2xl font-semibold mt-1">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-muted-foreground">
            Tổng danh sách và task hiện có, gồm Inbox và task con, không tính
            mục đã xóa. Task được tính theo danh sách sở hữu; danh sách được
            chia sẻ từ người khác không được tính. Hệ thống chưa ghi nhận người
            trực tiếp hoàn thành task trong danh sách dùng chung.
          </p>
          <h3 className="text-sm font-medium">Task hoàn thành theo ngày</h3>
          {!data.completedTasks && (
            <p role="status" className="text-sm text-muted-foreground">
              Chưa có task hoàn thành trong khoảng thời gian này.
            </p>
          )}
          <div
            className="h-48 w-full min-w-0"
            role="img"
            aria-label={`Biểu đồ task hoàn thành trong ${data.days} ngày`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.daily} margin={{ right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => String(value).slice(5)}
                  minTickGap={28}
                />
                <YAxis allowDecimals={false} />
                <Tooltip
                  labelFormatter={(value) =>
                    String(value).split("-").reverse().join("/")
                  }
                />
                <Bar
                  dataKey="completedTasks"
                  name="Task hoàn thành"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground">
            Trung bình = số task đang ở trạng thái hoàn thành có ngày hoàn thành
            trong kỳ / {data.days} ngày, gồm cả ngày không hoàn thành task. Ngày
            hiện tại được tính đến thời điểm tải, theo giờ Việt Nam.
          </p>
        </>
      )}
    </section>
  );
}
