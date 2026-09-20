"use client";
import SectionList from "@/app/(front)/component/sectionList.component";
import { useList } from "@/app/(front)/feature/hook/useListQuery.hook";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";


const page = () => {
  const {setTitle} = useHeader();
  const {inbox} = useWorkspaceStore()
  const list = useWorkspaceStore(useShallow((state) => state.listIndex[inbox!]))??{list:{}}; 
   const sectionIds =list.sections
  useEffect(() => {
  setTitle("Hộp thư");
  }, [inbox]);
  if(!inbox || !list){
    return
  }
  return <SectionList listId={inbox} sections={sectionIds??[]} />;
};

export default page;
