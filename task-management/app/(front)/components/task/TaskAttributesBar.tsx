import { cn } from "@/lib/utils";
import { File, Flag, Folder, InboxIcon, Repeat, Tag, Target, Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IListModel, ISectionModel } from "../../model";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import CalendarComponent from "../calendar/calendar.component";
import { formatDate } from "../../utils/getDayOfMonth.utils";
import { IRuleModel } from "../../model/rule/rule.model";


const PRIORITY_CONFIG = [
  { value: 1, label: "Ưu tiên 1", colorClass: "text-red-500 fill-red-500" },
  { value: 2, label: "Ưu tiên 2", colorClass: "text-blue-500 fill-blue-500" },
  { value: 3, label: "Ưu tiên 3", colorClass: "text-yellow-500 fill-yellow-500" },
  { value: 4, label: "Ưu tiên 4", colorClass: "" },
] as const;

interface TaskAttributesBarProps {
  lists: Pick<IListModel,"id"|"isShareList"|"sections"|"name"|"user">[];
  confirmListName: string;
  confirmSectionName:string;
  onSelectList: ({list,section}:{list: Pick<IListModel,"id"|"isShareList"|"sections"|"name"|"user">,section?:ISectionModel}) => void;
  confirmedRule: Pick<IRuleModel, "end_date" | "start_date" | "repeat" | "timer"|"priority"|"tags">;
  onChangeRule: (rule: TaskAttributesBarProps["confirmedRule"]) => void;
  onSelectPriority: (digit: string) => void;
}

const TaskAttributesBar = ({
  lists,
  confirmListName,
  confirmSectionName,
  onSelectList,
  confirmedRule,
  onChangeRule,
  onSelectPriority,

}: TaskAttributesBarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-1 mt-2 w-full">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <span className="p-1.5 border rounded-sm text-sm flex items-center gap-2 text-neutral-700">
            <InboxIcon className="size-3" /> <span className="text-sm">{confirmListName}{confirmSectionName&&"/"+confirmSectionName}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={cn("max-h-50 min-w-50 p-0 rounded-none")}>
          {lists.map((p) => (
            <>
              <DropdownMenuItem
              key={p.id}
              className="flex gap-3 items-center cursor-pointer border-b p-2 rounded-none"
              onSelect={() => onSelectList({list:p})}
            >
              <Folder className={cn("size-3")} />
              {p.name}
            </DropdownMenuItem>
            {
              p.sections?.map((section)=>{
                return               <DropdownMenuItem
              key={p.id}
              className="flex gap-3 items-center cursor-pointer rounded-none p-2 border-b"
              onSelect={() => onSelectList({
                list:p,
                section:section
              })}
            >
              <File className={cn("size-3 ml-3")} />
              {section.name}
            </DropdownMenuItem>
              })
            }</>
            
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center rounded-sm border border-input overflow-hidden text-neutral-700">
        <CalendarComponent
          rule={confirmedRule}
          trigger={
            <Button
              variant="ghost"
              className="flex items-center gap-1.5 rounded-none m-0! border-0 hover:bg-neutral-200 cursor-pointer p-1!"
            >
              <span className={cn("flex text-sm gap-1 items-center")}>
                <Timer className="w-4 h-4" />
                {confirmedRule.start_date ? formatDate(confirmedRule.start_date) : "Thêm ngày"}
              </span>
              {confirmedRule.timer && (
                <span className="flex items-center gap-1 text-sm">{confirmedRule.timer}</span>
              )}
              {confirmedRule.repeat?.mode !== "none" && <Repeat className="w-4 h-4" />}
            </Button>
          }
          onChangeSubmit={(pick)=>{
            onChangeRule(({
              ...confirmedRule,
              end_date:pick.end_date,
              repeat:pick.repeat,
              start_date:pick.start_date,
              timer:pick.timer
            }))
          }}
        />

        {confirmedRule.start_date && (
          <Button
            variant="outline"
            size="icon"
            className={cn("rounded-none border-0 border-l! m-0 p-1! z-10")}
            onClick={(e) => {
              e.stopPropagation();
              onChangeRule({
                ...confirmedRule,
                end_date: undefined,
                start_date: undefined,
                timer: undefined,
                repeat: { mode: "none" },
              });
            }}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {confirmedRule.end_date && (
        <div className="flex items-center rounded-sm border border-input overflow-hidden">
          <div className="flex items-center gap-1.5 px-2 py-1.5 text-sm">
            <Target className="w-4 h-4" />
            <span>{formatDate(confirmedRule.end_date)}</span>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="rounded-none border-0 border-l p-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onChangeRule({ ...confirmedRule, end_date: undefined });
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger>
          <span className="p-1.5 border rounded-sm text-sm flex items-center gap-2 text-neutral-700">
            <Flag className="size-3" /> P{confirmedRule.priority ?? 4}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {PRIORITY_CONFIG.map((p) => (
            <DropdownMenuItem
              key={p.value}
              className="flex gap-3 items-center cursor-pointer"
              onSelect={() => onSelectPriority(p.value.toString())}
            >
              <Flag className={cn("size-3", p.colorClass)} />
              {p.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {confirmedRule.tags.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="p-1.5 border rounded-sm text-sm flex items-center gap-2 text-neutral-500"
        >
          <Tag className="size-3" /> {t}
        </span>
      ))}
    </div>
  );
};

export default TaskAttributesBar;