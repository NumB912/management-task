"use client"
import SectionList from "@/app/(front)/component/sectionList.component";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { useEffect, use } from "react";

const Page = ({ params }: { params: Promise<{ listId: string }> }) => {
  const { listId } = use(params);
  const { setTitle } = useHeader();
  const {list} = useWorkspaceStore((state) => state.listInfo[listId])??{list:{}};
  useEffect(() => {
    if (list) setTitle(list.name); 
  }, [list]);

  return <SectionList listId={listId} sections={list?.sections ?? []} />;
};

export default Page;