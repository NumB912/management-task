"use client";
import SectionList from "@/app/(front)/components/section/sectionList.component";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/feature/store/workspace.state";
import { useRouter } from "next/navigation";
import { useEffect, use } from "react";
import { useShallow } from "zustand/react/shallow";

const Page = ({ params }: { params: Promise<{ listId: string }> }) => {
  const { listId } = use(params);
  const { setTitle } = useHeader();
  const list = useWorkspaceStore(
    useShallow((state) => state.listIndex[listId]),
  );
  const route = useRouter();
  const sectionIds = list?.sections;
  useEffect(() => {
    if (!list) {
      route.replace("/dashboard/work/inbox");
    }
    if (list) setTitle(`${list.name}`);
  }, [list, setTitle]);

  return <SectionList listId={listId} sections={sectionIds ?? []} />;
};

export default Page;
