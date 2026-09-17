"use client"
import SectionList from "@/app/(front)/component/sectionList.component";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { useEffect, use } from "react";
import { useShallow } from "zustand/react/shallow";

const Page = ({ params }: { params: Promise<{ listId: string }> }) => {
  const { listId } = use(params);
  const { setTitle } = useHeader();
  const list = useWorkspaceStore(useShallow((state) => state.listInfo[listId]))??{list:{}};
  const sections = useWorkspaceStore(useShallow((state)=>Object.values(state.sectionIndex).filter((section)=>section.list==listId)))??[]
  useEffect(() => {
    if (list) setTitle(list.name); 
  }, [list]);
  return <SectionList listId={listId} sections={sections?? []} />;
};

export default Page;