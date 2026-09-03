"use client";

import { use } from "react"; // React 19 API — unwrap Promise trong Client Component
import { taskApi } from "@/app/(front)/feature/api/task/task.api";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/app/(front)/components/ui/card";

interface PageProps {
  params: Promise<{ taskId: string }>;
}

export default function TaskPage({ params }: PageProps) {
  const { taskId } = use(params);

  const { data: task, isLoading, error } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => taskApi.getById(taskId),
  });
  if (isLoading) return <Skeleton />;
  if (error) return <div>Không thể tải task</div>;
  return (
    <div className="max-w-7xl mx-auto">
      <Card>
        <CardContent className="w-full">
           <p>Hello</p>
        </CardContent>

      </Card>
    </div>
  );
}