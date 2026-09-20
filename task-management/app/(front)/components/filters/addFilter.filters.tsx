"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "../../states/workspace.state";
import { useShallow } from "zustand/react/shallow";
import { Ipriority, ISpecials, IStatus } from "../../model/type/type";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Calendar } from "../ui/calendar";
import { filterApi } from "../../feature/api/filters/filter.api";
import { Label } from "../ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface addFilterDialogProps {
  open: boolean;
  onClose: () => void;
}

const PRIORITY_OPTIONS: {
  value: Ipriority;
  label: string;
  className: string;
}[] = [
  {
    value: 1,
    label: "P1",
    className: cn(
      "text-red-600! border-red-300!",
      "data-[state=on]:bg-red-500! data-[state=on]:text-white!"
    ),
  },
  {
    value: 2,
    label: "P2",
    className: cn(
      "text-orange-600! border-orange-300!",
      "data-[state=on]:bg-orange-500! data-[state=on]:text-white!"
    ),
  },
  {
    value: 3,
    label: "P3",
    className: cn(
      "text-blue-600! border-blue-300!",
      "data-[state=on]:bg-blue-500! data-[state=on]:text-white!"
    ),
  },
  {
    value: 4,
    label: "P4",
    className: cn(
      "text-muted-foreground border-border",
      "data-[state=on]:bg-muted-foreground! data-[state=on]:text-white!"
    ),
  },
];

const SPECIALS_OPTIONS: { value: ISpecials; label: string }[] = [
  { value: "none", label: "Không" },
  { value: "overdue", label: "Quá hạn" },
  { value: "today", label: "Hôm nay" },
  { value: "next 7 days", label: "7 ngày tới" },
];

const STATUS_OPTIONS: { value: IStatus; label: string }[] = [
  { value: "pending", label: "Đang chờ" },
  { value: "done", label: "Hoàn thành" },
  { value: "won't do", label: "Sẽ không làm" },
];

export function AddFilterDialog({ open, onClose }: Readonly<addFilterDialogProps>) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Ipriority | undefined>(undefined);
  const [specials, setSpecials] = useState<ISpecials>("none");
  const [status, setStatus] = useState<IStatus>("pending");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

  const queryClient = useQueryClient();
  const {tagIndex} = useWorkspaceStore();

  const existingNames = useWorkspaceStore(
    useShallow((s) =>
      Object.values(s.filterIndex).map((item) =>
        item.name.trim().toLowerCase()
      )
    )
  );

  useEffect(() => {
    if (open) {
      setError(null);
      setDateError(null);
    }
  }, [open]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: any) => filterApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success("Đã thêm filter");
      resetForm();
      onClose();
    },
    onError: () => toast.error("Thêm thất bại, thử lại sau"),
  });

  const validate = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return "Tên filter không được để trống";
    if (existingNames.includes(trimmed.toLowerCase())) {
      return "Tên filter đã tồn tại";
    }
    return null;
  };

  const handleChange = (value: string) => {
    setName(value);
    setError(validate(value));
  };

  const validateDateRange = (start?: Date, end?: Date) => {
    if (start && end && start > end) {
      setDateError("Ngày bắt đầu phải trước ngày kết thúc");
    } else {
      setDateError(null);
    }
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    validateDateRange(date, endDate);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    validateDateRange(startDate, date);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setPriority(undefined);
    setSpecials("none");
    setStatus("pending");
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedTags([]);
    setError(null);
    setDateError(null);
  };

  const toggleTag = (name: string) => {
    setSelectedTags((prev) =>
      prev.includes(name)
        ? prev.filter((t) => t !== name)
        : [...prev, name]
    );
  };

  const removeTag = (e: React.MouseEvent, tagId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTags((prev) => prev.filter((t) => t !== tagId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (dateError) return;

    mutate({
      name: trimmed,
      description: description.trim() || undefined,
      priority,
      specials,
      status,
      start_date: startDate,
      end_date: endDate,
      tags: selectedTags??[],
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="min-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className={cn("font-bold!")}>Thêm filter</DialogTitle>
            <DialogDescription>
              Tạo bộ lọc mới để tổ chức công việc của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-5 py-4">
            <div className="flex flex-col gap-3 py-4 w-full">
              <div className="grid gap-2">
              <Label htmlFor="name">Tên filter</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleChange(e.target.value)}
                autoFocus
                maxLength={100}
                placeholder="Tên filter"
                aria-invalid={!!error}
                className={cn(`rounded! px-3! py-5! ${error && "border-destructive!"}`)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả (tuỳ chọn)"
                rows={2}
                className={cn("rounded!")}
              />
            </div>
            </div>

            <div className="min-w-xs flex flex-col gap-5">
            <div className="grid gap-2">
               <Label className="font-bold">Độ ưu tiên</Label>
              <ToggleGroup
                type="single"
                value={priority?.toString()}
                onValueChange={(v) =>
                  setPriority(v ? (Number(v) as Ipriority) : undefined)
                }
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <ToggleGroupItem
                    key={p.value}
                    value={p.value.toString()}
                    className={cn("border! rounded!", p.className)}
                  >
                    {p.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
            <div className="grid gap-2">
              <Label className="font-bold">Thẻ</Label>
              <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <div
                    role="combobox"
                    aria-expanded={tagPopoverOpen}
                    tabIndex={0}
                    className={cn(
                      "border-input rounded! w-full min-h-9 flex flex-wrap items-center gap-1 px-3 py-1.5 text-sm border cursor-pointer",
                      "focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none",
                      selectedTags.length === 0 && "text-muted-foreground"
                    )}
                  >
                    {selectedTags.length === 0 ? (
                      "Chọn thẻ"
                    ) : (
                      selectedTags.map((name) => {
                        const tag = Object.values(tagIndex).find((t) => t.name === name);
                        if (!tag) return null;
                        return (
                          <Badge
                            key={name}
                            variant="secondary"
                            className="rounded! gap-1 pr-1"
                          >
                            {tag.name}
                            <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => removeTag(e, name)}
                              className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </span>
                          </Badge>
                        );
                      })
                    )}
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm thẻ..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy thẻ nào.</CommandEmpty>
                      <CommandGroup>
                        {Object.values(tagIndex).map((tag) => {
                          const isSelected = selectedTags.includes(tag.name);
                          return (
                            <CommandItem
                              key={tag.id}
                              value={tag.name}
                              onSelect={() => toggleTag(tag.name)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {tag.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
               <Label className="font-bold">Thời gian đặc biệt</Label>
              <Select value={specials} onValueChange={(v) => setSpecials(v as ISpecials)}>
                <SelectTrigger className={cn("rounded! w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPECIALS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
               <Label className="font-bold">Trạng thái</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as IStatus)}>
                <SelectTrigger className={cn("rounded! w-full")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                 <Label className="font-bold">Ngày bắt đầu</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "rounded! w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate
                        ? format(startDate, "dd/MM/yyyy", { locale: vi })
                        : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                 <Label className="font-bold">Ngày kết thúc</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "rounded! w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate
                        ? format(endDate, "dd/MM/yyyy", { locale: vi })
                        : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      disabled={(date) => (startDate ? date < startDate : false)}
                      locale={vi}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {dateError && (
                <p className="col-span-2 text-sm text-destructive">{dateError}</p>
              )}
            </div>
            </div>
          </div>

          <DialogFooter className={cn("bg-transparent! p-3! border-t-0 mt-3")}>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim() || !!error || !!dateError}
            >
              {isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}