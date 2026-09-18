"use client"
import SectionList from "@/app/(front)/component/sectionList.component";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import React, { useEffect, use, useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

const Page = React.memo(({ params }: { params: Promise<{ listId: string }> }) => {
  const { listId } = use(params);
  const { setTitle } = useHeader();
  const list = useWorkspaceStore(useShallow((state) => state.listIndex[listId]))??{list:{}};
  const sectionIds =list.sections
  useEffect(() => {
    if (list) setTitle(list.name); 
  }, [list]);
  return <SectionList listId={listId} sections={sectionIds?? []} />;
});

export default Page;