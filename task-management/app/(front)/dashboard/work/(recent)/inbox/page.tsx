"use client";
import SectionList from "@/app/(front)/component/sectionList.component";
import { useList } from "@/app/(front)/feature/hook/useListQuery.hook";
import { useHeader } from "@/app/(front)/providers/header.provider";
import { useWorkspaceStore } from "@/app/(front)/states/workspace.state";
import { useEffect } from "react";


const page = () => {
  const {setTitle} = useHeader();
  const {inbox,listInfo} = useWorkspaceStore()
  const {data} = useList(inbox??"")
  useEffect(() => {
    setTitle("Hộp thư");
  }, []);
  if(!data){
    return
  }
  return <SectionList listId={data?.id} sections={listInfo[inbox!].list.sections??[]} />;
};

export default page;
