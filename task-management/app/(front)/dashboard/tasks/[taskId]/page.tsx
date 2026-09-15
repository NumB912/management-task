"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent } from "@/app/(front)/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/app/(front)/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/(front)/components/ui/select";

interface PageProps {
  params: Promise<{ taskId: string }>;
}


const mockTask = {
  title: "Thiết kế giao diện trang chủ",
  startDate: new Date(),
  deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // +5 ngày
  priority: "medium",
  tags: ["frontend", "urgent"],
};

const priorityColor: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

export default function TaskPage({ params }: Readonly<PageProps>) {
  const { taskId } = use(params);
  const router = useRouter();

  const [startDate, setStartDate] = useState<Date | undefined>(mockTask.startDate);
  const [deadline, setDeadline] = useState<Date | undefined>(mockTask.deadline);
  const [priority, setPriority] = useState<string>(mockTask.priority);
  const [tags, setTags] = useState<string[]>(mockTask.tags);
  const [tagInput, setTagInput] = useState("");

  const handleOpenChange = (open: boolean) => {
    if (!open) router.back();
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const removeTag = (t: string) => setTags(tags.filter((x) => x !== t));

  const handleSave = () => {
    // Chưa có API — tạm log ra console
    console.log("Save task", taskId, { startDate, deadline, priority, tags });
    router.back();
  };

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent className="blur-none sm:max-w-md rounded-sm max-w-lvh">
        <DialogHeader>
          <DialogTitle>{mockTask.title}</DialogTitle>
        </DialogHeader>

        <Card>
          <CardContent className="space-y-4 pt-4">
            {/* Start date */}
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Ngày bắt đầu</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Deadline */}
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Deadline</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "dd/MM/yyyy") : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Độ ưu tiên</span>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Badge className={priorityColor[priority] ?? ""} variant="secondary">
                {priority}
              </Badge>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Tags</span>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Thêm tag rồi Enter"
                />
                <Button type="button" variant="secondary" onClick={addTag}>
                  Thêm
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Lưu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}