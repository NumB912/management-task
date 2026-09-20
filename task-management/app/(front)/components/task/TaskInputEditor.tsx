import { cn } from "@/lib/utils";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Box, File, Folder, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IListModel, IListModelState, ISectionModel, ISectionModelState } from "../../model";
import React from "react";
import { useCreateTag } from "../../feature/hook/useTagMutation.hook";
import { toast } from "sonner";
import { useWorkspaceStore } from "../../states/workspace.state";

interface TaskInputEditorProps {
  refDivInput: React.RefObject<HTMLDivElement>;
  isEmpty: boolean;
  onInput: (e: React.FormEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  isOpenAddTag: boolean;
  setIsOpenAddTag: (v: boolean) => void;
  filteredTags: string[];
  tag: string;
  onAddTag: (v: string | null) => void;
  isOpenList: boolean;
  setIsOpenList: (v: boolean) => void;
  lists: Pick<
    IListModelState,
    "id" | "sections" | "name"
  >[];
  onAddList: (v: {
    list: Pick<IListModelState, "id" |"sections" | "name">;
    section?: ISectionModelState;
  }) => void;
}

const TaskInputEditor = ({
  refDivInput,
  isEmpty,
  onInput,
  onKeyDown,
  isOpenAddTag,
  setIsOpenAddTag,
  filteredTags,
  tag,
  onAddTag,
  isOpenList,
  setIsOpenList,
  lists,
  onAddList,
}: TaskInputEditorProps) => {
const { mutate: createTag } = useCreateTag();
const sections = useWorkspaceStore((state)=>state.sectionIndex)
const handleAddTag = (v: string | null) => {
  const name = v?.trim() ?? "";
  if (!name) return; 

  createTag(
    { name },
    {
      onSuccess: (data) => {
        onAddTag(v);         
        toast.success(`Đã tạo tag "${name}"`);
      },
      onError: (error) => {
        toast.error("Tạo tag thất bại, thử lại nhé");
      },
    }
  );
};


  return (
    <div className="relative w-full ">
      <div
        contentEditable
        suppressContentEditableWarning
        onInput={onInput}
        onKeyDown={onKeyDown}
        ref={refDivInput}
        data-placeholder="Thêm nhiệm vụ"
        className={cn(
          "rounded-sm p-2! border relative text-wrap max-w-xs",
          isEmpty
            ? "before:content-[attr(data-placeholder)] before:text-muted-foreground before:pointer-events-none cursor-start before:absolute"
            : "",
        )}
      />

      {isOpenAddTag && (
        <Combobox
          items={filteredTags}
          open={isOpenAddTag}
          onOpenChange={setIsOpenAddTag}
          onValueChange={(v: string | null) => onAddTag(v)}
        >
          <ComboboxInput className={cn("h-0! w-full! p-0! invisible")} />
          <ComboboxContent className={cn("w-full! p-0! -mt-3! relative")}>
            {filteredTags.length === 0 && (
              <ComboboxEmpty className={cn("w-full! flex gap-1 p-1!")}>
                <Button
                  onClick={()=>handleAddTag(tag)}
                  className="w-full"
                  variant={"ghost"}
                >
                  <p>Tạo thêm thẻ</p>
                  <p>#{tag}</p>
                </Button>
              </ComboboxEmpty>
            )}
            <ComboboxList>
              {(item) => (
                <ComboboxItem
                  className={cn("flex gap-2 w-full")}
                  key={item}
                  value={item}
                >
                  <Tag /> {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}

      {isOpenList && (
        <Combobox
          open={isOpenList}
          onOpenChange={setIsOpenList}
          onValueChange={(
            v: {
              list: Pick<IListModelState,"id"| "sections" | "name">,
              section?: ISectionModelState;
            } | null,
          ) => {
            if (v?.list && v.section){
                 onAddList({
                list: v.list,
                section:v.section
              });
            }else if(v?.list){
               onAddList({
                list: v.list,
              });
            }
          }}
          value={null}
        >
          <ComboboxInput className={cn("h-0! w-full! p-0! invisible")} />
          <ComboboxContent
            className={cn("w-full! p-0! -mt-3! relative rounded-sm max-w-50!")}
          >
            <ComboboxList>
              {lists.map((list) => (
                <React.Fragment key={list.id}>
                  <ComboboxItem
                    className={cn("flex gap-2 w-full p-2 rounded-none")}
                    value={{
                      list: list,
                    }}
                    key={list.id}
                  >
                    <Folder className="h-4 w-4" />
                    <span className="text-ellipsis! max-w-60 overflow-hidden">
                      {list.name}
                    </span>
                  </ComboboxItem>

                  {list.sections?.map((section) => (
                    <ComboboxItem
                      className={cn("flex gap-2 w-full p-2 rounded-none")}
                      value={{
                        list: list,
                        section: sections[section],
                      }}
                      key={section}
                    >
                      <File className="h-4 w-4 ml-5" />
                      <span className="text-ellipsis! max-w-60 overflow-hidden">
                        {sections[section].name}
                      </span>
                    </ComboboxItem>
                  ))}
                </React.Fragment>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      )}
    </div>
  );
};

export default TaskInputEditor;
