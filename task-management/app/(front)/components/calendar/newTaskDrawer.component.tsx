"use client";

import { useState } from "react";
import { Mail, CalendarDays, CalendarClock, Flag, Plus, Repeat, Calendar1 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import ListPicker from "@/app/(front)/components/listCombobox";
import CalendarComponent from "@/app/(front)/components/calendar/calendar.component";
import PriorityDropdown from "@/app/(front)/components/piorityCombobox";
import TagCombobox from "@/app/(front)/components/tagCompobox";

import { ICreateTaskModel, IRuleModel, ITaskModel } from "@/app/(front)/model";
import { formatDate } from "@/app/(front)/utils/getDayOfMonth.utils";
import ColorPicker from "../color/colorPicker.component";
import { PRIORITY_LABEL } from "../../model/mod/priorityConfig";
import { formatTimer } from "../../utils/formatTimer";
import { DEFAULT_COLORS } from "../../model/mod/color.config";

interface CreateTaskFormProps {
  defaultValue?:ICreateTaskModel
  onCancel: () => void;
  onSave: (data: ICreateTaskModel) => void;
}

export default function CreateTaskForm({
  defaultValue={
    list:"",
    section:"",
    name:"",
    rule:{
      list:"",
      repeat:{
        mode:"none",
      },
      tags:[],
      color:"",
      priority:4,
    }
  },
  onCancel,
  onSave,
}: CreateTaskFormProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)]);
  const [list, setList] = useState(defaultValue.list);
  const [section, setSection] = useState(defaultValue.section);
  const [rule, setRule] = useState<Partial<IRuleModel>>(defaultValue.rule);
  const [tags, setTags] = useState<string[]>([]);
  const [openTags, setOpenTags] = useState(false);
  const [openPriority, setOpenPriority] = useState(false);
  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      list,
      section,
      rule: {
        list: list,
        repeat: {
          mode: "none",
        },
        ...rule,
        tags: tags,
        color:color,
      },
    });
  };

  const onConfirmTags = (newTags: string[]) => {
    setTags(newTags);
    setOpenTags(false);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-5 pb-4 border-b">
        <h2 className="text-lg font-semibold">Tạo công việc</h2>
      </div>

      <div className="flex flex-col gap-4 p-5 overflow-y-auto flex-1">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Tên công việc</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên công việc"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Danh sách</span>
          <ListPicker
            selectedList={list}
            selectedSection={section}
            onSelect={({ list, section }) => {
              setList(list);
              setSection(section!);
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Ngày</span>
          <CalendarComponent
            rule={rule as IRuleModel}
            onChangeSubmit={(r) => setRule((prev) => ({ ...prev, ...r }))}
            trigger={
              <Button
                variant="outline"
                className="flex w-full p-2! justify-start gap-2 rounded-md font-normal text-neutral-700!"
              >
                                   {rule?.start_date ? (
                          <div className="flex gap-1.5 items-center">
                            <Calendar1 />

                            <p>{formatDate(rule.start_date)}</p>

                            {rule.repeat?.mode !== "none" && <Repeat />}

                            {rule.timer && (
                              <span>{formatTimer(rule.timer)}</span>
                            )}
                                 {rule.endTimer && (
                              <span>{formatTimer(rule.endTimer)}</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center">
                            <Plus className="w-2 h-2" />

                            <span className="text-sm">Thêm ngày</span>
                          </div>
                        )}
              </Button>
            }
          />
        </div>

        {rule.end_date && (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Hạn chót</span>
            <Button
              variant="outline"
              className="flex w-full p-2! justify-start gap-2 rounded-md font-normal text-neutral-700!"
            >
              <CalendarClock className="w-4 h-4 text-neutral-400" />
              <span>{formatDate(rule.end_date)}</span>
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Etiquette</label>
          <ColorPicker value={color} onChange={setColor} inline />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Độ ưu tiên</span>
          <PriorityDropdown
            priority={rule.priority ?? 4}
            onSelectPriority={(p) =>
              setRule((prev) => ({ ...prev, priority: p as 1 | 2 | 3 | 4 }))
            }
            open={openPriority}
            onOpenChange={setOpenPriority}
            trigger={
              <Button
                variant="outline"
                className="flex w-full p-2! justify-start gap-2 rounded-md font-normal text-neutral-700!"
              >
                <Flag className="w-4 h-4 text-neutral-400" />
                <span>{PRIORITY_LABEL[rule.priority ?? 4]}</span>
              </Button>
            }
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex w-full justify-between items-center">
            <span className="text-sm font-medium">Thẻ</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-fit w-fit"
              onClick={() => setOpenTags(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <TagCombobox
            selectedTags={tags}
            onConfirm={onConfirmTags}
            onCreateTag={() => {}}
            open={openTags}
            onOpenChange={setOpenTags}
            trigger={
              <div className="flex flex-wrap gap-1.5">
                {tags.length === 0 ? (
                  <span className="text-sm text-neutral-500">
                    Không có thẻ được thêm vào
                  </span>
                ) : (
                  tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="ghost"
                      className="text-xs outline-1 outline-neutral-300 text-black"
                    >
                      {tag}
                    </Badge>
                  ))
                )}
              </div>
            }
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 p-4 border-t shrink-0">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          disabled={!name.trim()}
          className="bg-black text-white hover:bg-neutral-800"
        >
          Lưu
        </Button>
      </div>
    </div>
  );
}
