"use client";

import { use } from "react";
import TaskDetail from "@/app/(front)/components/task/taskDetail";

interface PageProps {
  params: Promise<{ taskId: string }>;
}

export default function TaskPage({ params }: Readonly<PageProps>) {
  const { taskId } = use(params);
  
return (<TaskDetail taskId={taskId}/>);
}
