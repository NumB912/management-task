"use client";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useRouter, usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CalendarDays,
  ChevronDown,
  Copy,
  Edit,
  Filter,
  Folder,
  Inbox,
  List,
  MoreHorizontal,
  Pencil,
  Plus,
  Share2,
  Tag,
  Trash,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";

import React, { useEffect, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useWorkspaceStore } from "../../states/workspace.state";
import { useShallow } from "zustand/react/shallow";
import NavComponent from "../../components/nav.components";
import { EditListDialog } from "../../components/lists/editList";
import { DeleteListDialog } from "../../components/lists/deleteList";
import { AddListDialog } from "../../components/lists/addList";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { SharedMenuItems } from "../../components/lists/menuItems";
import { ShareModalClient } from "../../components/share/shareModelClient.component";
import { useShareModalStore } from "../../states/share/share.state";
import EntityRow from "../../components/entity-row/entityRow";
import { AddTagDialog } from "../../components/tags/addTags";
import { EditTagDialog } from "../../components/tags/editTags";
import { DeleteTagDialog } from "../../components/tags/deleteTags";
import { ITagModel } from "../../model";
import { AddFilterDialog } from "../../components/filters/addFilter.filters";
import { EditFilterDialog } from "../../components/filters/editFilter.filters";
import { IFilterModel } from "../../model/filter.model";
import { DeleteFilterDialog } from "../../components/filters/deleteFilter";
import NotificationBell from "../../components/notifier/notificationBell";
const layout = ({
  children,

}: {
  children: React.ReactNode;
}) => {
  const listIndex = useWorkspaceStore(useShallow((s) => s.listIndex));
  const {getTodayTaskCount,getNextDayCount,getInboxCount,filterIndex,tagIndex} = useWorkspaceStore()

  const pathName = usePathname();
  const [openList, setOpenList] = useState<boolean>(true);
  const [openFilter, setOpenFilter] = useState<boolean>(true);
  const [openTag, setOpenTag] = useState<boolean>(true);
  const [openShareTag, setOpenShareTag] = useState<boolean>(true);
  const { open } = useShareModalStore();
  const [editingList, setEditingList] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deletingList, setDeletingList] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [deleteTag, setDeleteTag] = useState<ITagModel | null>(null);
  const [deleteFilter, setdeleteFilter] = useState<IFilterModel | null>(null);
  const [editTag, setEditTag] = useState<ITagModel | null>(null);
  const [editFilter, setEditFilter] = useState<IFilterModel | null>(null);
  const [openAddFilter, setOpenAddFilter] = useState<boolean>(false);
  const [openAddTag, setOpenAddTag] = useState<boolean>(false);
  const [openAddList, setOpenAddList] = useState<boolean>(false);
  const getTaskWithFilter = useWorkspaceStore((state)=>state.getTaskFilter)
  const getTaskQuantityWithList = useWorkspaceStore((state)=>state.getTaskQuantityWithList)
  const getTaskQuantityWithTag = useWorkspaceStore((state)=>state.getTaskQuantityWithTag)
  const tabs = [
    {
      title: "Hôm nay",
      href: "/dashboard/work/today",
      Icon: Inbox,
      count: getTodayTaskCount(),
    },
    {
      title: "Hộp thư",
      href: "/dashboard/work/inbox",
      Icon: Calendar,
      count: getInboxCount(),
    },
    {
      title: "Sắp tới",
      href: "/dashboard/work/up-comming",
      Icon: CalendarDays,
      count: getNextDayCount(),
    },
  ];
  const listEntries = Object.entries(listIndex);
  return (
    <div className="flex h-screen relative overflow-hidden overflow-y-scroll">
      <Sidebar className={cn("absolute left-0")}>
        <SidebarContent className="bg-linear-to-b from-primary/20 to-violet-100">
          <SidebarGroup className={"border-b border-black/10"}>
            <SidebarMenu className={cn("gap-1")}>
              {tabs.map((tab) => {
                const isActive = pathName == tab.href;
                return (
                  <SidebarMenuItem key={tab.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        `h-fit ${isActive ? "bg-white/80!" : "hover:bg-primary/10! hover:text-black"}`,
                      )}
                    >
                      <Link
                        href={tab.href}
                        className={`flex flex-1 gap-2 items-center p-1 px-3`}
                      >
                        <tab.Icon />
                        <span className="flex justify-between items-center gap-2 w-full text-md">
                          <span>{tab.title}</span>
                          <span className="text-neutral-700">{tab.count}</span>
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup className={cn(`gap-2`)}>
            <Collapsible open={openList} onOpenChange={setOpenList}>
              <CollapsibleTrigger
                asChild
                className={cn(
                  "hover:bg-primary/10! group/list-label rounded-md w-full pl-1! pr-0",
                )}
              >
                <SidebarGroupLabel className="flex justify-between text-xs text-neutral-500 font-bold">
                  <span className={`flex items-center`}>
                    <ChevronDown
                      size={14}
                      className={cn(
                        `transition-all ${openList ? "rotate-180" : "rotate-0"} group-hover/list-label:visible! invisible!`,
                      )}
                    />
                    <span>Danh sách</span>
                  </span>
                  <Button
                    variant={"ghost"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenAddList(!openAddList);
                    }}
                    className={cn(
                      "w-fit rounded aspect-square hover:bg-transparent! hover:text-primary group-hover/list-label:visible! invisible!",
                    )}
                  >
                    <Plus />
                  </Button>
                </SidebarGroupLabel>
              </CollapsibleTrigger>

              <CollapsibleContent>
                {listEntries.length === 0 && (
                  <div className="bg-muted/10 my-2 mx-3 rounded-md text-neutral-500">
                    <p className="text-sm px-3 py-2 leading-6">
                      Chưa có danh sách nào
                    </p>
                  </div>
                )}

                {listEntries.map(([listId, info]) => {
                  const isActive =
                    pathName === `/dashboard/work/lists/${listId}`;

                  const listActions = [
                    {
                      icon: <Edit size={16} />,
                      label: "Chỉnh sửa",
                      onSelect: () =>
                        setEditingList({ id: listId, name: info.name }),
                    },
                    {
                      icon: <Trash2 size={16} />,
                      label: "Xóa",
                      destructive: true,
                      onSelect: () =>
                        setDeletingList({ id: listId, name: info.name }),
                    },
                    {
                      icon: <Share2 size={16} />,
                      label: "Chia sẻ",
                      onSelect: () => {
                        open(listId);
                      },
                    },
                  ];
                  if (info.name.toLocaleLowerCase() == "inbox") {
                    return;
                  }
                  return (
                    <ContextMenu key={listId}>
                      <ContextMenuTrigger asChild>
                        <Button
                          variant={"ghost"}
                          asChild
                          className={cn(
                            `w-full rounded-md flex justify-between items-center h-fit`,
                            isActive
                              ? "bg-white/80! text-primary!"
                              : "hover:bg-primary/10! hover:text-black",
                          )}
                        >
                          <Link
                            href={`/dashboard/work/lists/${listId}`}
                            className="flex justify-between items-center group/list-item w-full p-2!"
                          >
                            <span className="flex items-center gap-2 pl-1">
                              <Folder
                                data-icon="inline-start"
                                className={cn("w-4! h-4!")}
                              />
                              <span className="flex items-center gap-1 text-sm min-w-0">
                                <span className="truncate max-w-30">
                                  {info.name}
                                </span>
                                {info.isShareList && (
                                  <Users size={12} className="shrink-0" />
                                )}
                              </span>
                            </span>

                            <span className="flex items-center gap-2 relative">
                              <span className="group-hover/list-item:hidden flex-1 absolute right-1 text-sm text-neutral-600">
                                {getTaskQuantityWithList(listId)??0}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  className={cn(
                                    `group-hover/list-item:visible invisible absolute right-0`,
                                  )}
                                >
                                  <span className="hover:text-primary!">
                                    <MoreHorizontal size={16} />
                                  </span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  side="right"
                                  sideOffset={20}
                                >
                                  <SharedMenuItems
                                    as="dropdown"
                                    actions={listActions}
                                  />
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </span>
                          </Link>
                        </Button>
                      </ContextMenuTrigger>

                      <ContextMenuContent>
                        <SharedMenuItems as="context" actions={listActions} />
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openFilter} onOpenChange={setOpenFilter}>
              <CollapsibleTrigger
                asChild
                className={cn(
                  "hover:bg-primary/10! group/list-label rounded-md w-full pl-1!",
                )}
              >
                <SidebarGroupLabel className="flex justify-between text-xs text-neutral-500 font-bold">
                  <span className={`flex items-center`}>
                    <ChevronDown
                      size={14}
                      className={cn(
                        `transition-all ${openFilter ? "rotate-180" : "rotate-0"} group-hover/list-label:visible! invisible!`,
                      )}
                    />
                    <span>Bộ lọc</span>
                  </span>
                  <Button
                    variant={"ghost"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenAddFilter((prev) => !prev);
                    }}
                    className={cn(
                      "rounded p-0.5 aspect-square hover:bg-transparent! hover:text-primary group-hover/list-label:visible! invisible!",
                    )}
                  >
                    <Plus />
                  </Button>
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {(Object.values(filterIndex) ?? []).length === 0 && (
                  <div className="bg-muted/10 my-2 mx-3 rounded-md text-neutral-500">
                    <p className="text-sm px-3 py-2 leading-6">
                      Chưa có bộ lọc nào, bạn hãy thêm bộ lọc để tìm kiểm thêm
                      dễ dàng hơn
                    </p>
                  </div>
                )}
                {(Object.values(filterIndex) ?? [])?.map((filter:IFilterModel) => (
                  <EntityRow
                    key={filter.id}
                    link={`/dashboard/work/filters/${filter.id}`}
                    icon={<Filter data-icon="inline-start" size={16} />}
                    name={filter.name}
                    count={getTaskWithFilter(filter.id).length}
                    actionGroups={[
                      [
                        {
                          label: "Chỉnh sửa",
                          icon: <Pencil size={14} />,
                          onClick: () => {
                            setEditFilter(filter);
                          },
                        },
                      ],
                      [
                        {
                          label: "Xóa",
                          icon: <Trash size={14} />,
                          onClick: () => {
                            setdeleteFilter(filter);
                          },
                          variant: "destructive",
                        },
                      ],
                    ]}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={openTag} onOpenChange={setOpenTag}>
              <CollapsibleTrigger
                className={cn(
                  "hover:bg-primary/10! group/tag-label rounded-md w-full pl-1!",
                )}
                asChild
              >
                <SidebarGroupLabel className="flex justify-between text-xs text-neutral-500 font-bold">
                  <span className="flex items-center">
                    <ChevronDown
                      size={15}
                      className={cn(
                        `transition-all ${openTag ? "rotate-180" : "rotate-0"} group-hover/tag-label:visible invisible`,
                      )}
                    />
                    <span>Thẻ</span>
                  </span>
                  <Button
                    variant={"ghost"}
                    className={cn(
                      "rounded p-0.5 aspect-square hover:bg-transparent! hover:text-primary  group-hover/tag-label:visible invisible",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenAddTag(!openAddTag);
                    }}
                  >
                    <Plus />
                  </Button>
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {(Object.values(tagIndex) ?? []).length === 0 && (
                  <div className="bg-muted/10 my-2 mx-3 rounded-md text-neutral-500">
                    <p className="text-sm px-3 py-2 leading-6">
                      Chưa có thẻ nào, bạn hãy thêm thẻ để tìm kiểm thêm dễ dàng
                      hơn
                    </p>
                  </div>
                )}
                {(Object.values(tagIndex) ?? [])
                  .filter((tag: ITagModel) => !tag.isShareTag)
                  .map((tag: ITagModel) => (
                    <EntityRow
                      key={tag.id}
                      link={`/dashboard/work/tags/${tag.name}`}
                      icon={
                        <Tag
                          data-icon="inline-start"
                          className={cn("w-3! h-3!")}
                        />
                      }
                      name={tag.name}
                      actionGroups={[
                        [
                          {
                            label: "Chỉnh sửa",
                            icon: <Pencil size={14} />,
                            onClick: () => {
                              setEditTag(tag);
                            },
                          },
                          {
                            label: "Xóa",
                            icon: <Trash size={14} />,
                            onClick: () => {
                              setDeleteTag(tag);
                            },
                          },
                        ],
                      ]}
                      count={getTaskQuantityWithTag(tag.name)}
                    />
                  ))}

                {(Object.values(tagIndex).filter((tag: ITagModel) => tag.isShareTag) ?? [])
                  .length !== 0 && (
                  <Collapsible
                    open={openShareTag}
                    onOpenChange={setOpenShareTag}
                    className="pl-3"
                  >
                    <CollapsibleTrigger
                      className={cn(
                        "hover:bg-primary/10! group/tag-label rounded-md w-full pl-1!",
                      )}
                      asChild
                    >
                      <SidebarGroupLabel className="flex justify-between text-xs text-neutral-500 font-bold">
                        <span className="flex items-center">
                          <ChevronDown
                            size={15}
                            className={cn(
                              `transition-all ${openTag ? "rotate-180" : "rotate-0"} group-hover/tag-label:visible invisible`,
                            )}
                          />
                          <span>Thẻ được chia sẻ</span>
                        </span>
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {(Object.values(tagIndex)?? [])
                        .filter((tag: ITagModel) => tag.isShareTag)
                        .map((tag: ITagModel) => (
                          <EntityRow
                            key={tag.id}
                            link={`/dashboard/work/tags/${tag.id}`}
                            icon={<Tag data-icon="inline-start" size={16} />}
                            name={tag.name}
                            count={getTaskQuantityWithTag(tag.name)}
                            actionGroups={[
                              [
                                {
                                  label: "Chỉnh sửa",
                                  icon: <Pencil size={14} />,
                                  onClick: () => {
                                    setEditTag(tag);
                                  },
                                },
                                {
                                  label: "Xóa",
                                  icon: <Trash size={14} />,
                                  onClick: () => {
                                    setDeleteTag(tag);
                                  },
                                },
                              ],
                            ]}
                          />
                        ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <NavComponent />
        <div className="flex-1 min-h-0 overflow-x-auto px-5 w-full">
          {children}
        </div>
      </div>
      <AddListDialog open={openAddList} onClose={() => setOpenAddList(false)} />
      <EditListDialog list={editingList} onClose={() => setEditingList(null)} />
      <DeleteListDialog
        list={deletingList}
        onClose={() => setDeletingList(null)}
      />
      <AddTagDialog open={openAddTag} onClose={() => setOpenAddTag(false)} />
      <DeleteTagDialog onClose={() => setDeleteTag(null)} tag={deleteTag} />
      <EditTagDialog onClose={() => setEditTag(null)} tag={editTag} />

      <AddFilterDialog
        open={openAddFilter}
        onClose={() => setOpenAddFilter(false)}
      />
      <EditFilterDialog
        open={!!editFilter}
        filter={editFilter}
        onClose={() => setEditFilter(null)}
      />
      <DeleteFilterDialog
        onClose={() => setdeleteFilter(null)}
        filter={deleteFilter}
      />
      <ShareModalClient />
    </div>
  );
};

export default layout;
