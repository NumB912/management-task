"use client";

import { useEffect, useState } from "react";
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { IFilterModel } from "../../model/filter.model";
import { workSpaceKeys } from "../../feature/hook/useWorkSpaceQuery.hook";

interface editFilterDialogProps {
  open: boolean;
  onClose: () => void;
  filter: IFilterModel | null;
}

const parseToDate = (dateVal: any): Date | null => {
  if (!dateVal) return null;
  const parsed = new Date(dateVal);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const getSafeTime = (dateVal: any): number | null => {
  const d = parseToDate(dateVal);
  return d ? d.getTime() : null;
};

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

export function EditFilterDialog({
  open,
  onClose,
  filter,
}: Readonly<editFilterDialogProps>) {
  const [name, setName] = useState(filter?.name ?? "");
  const [description, setDescription] = useState(filter?.description ?? "");
  const [priority, setPriority] = useState<Ipriority | undefined>(filter?.priority);
  const [specials, setSpecials] = useState<ISpecials>(filter?.specials ?? "none");
  const [status, setStatus] = useState<IStatus>(filter?.status ?? "pending");
  const [startDate, setStartDate] = useState<Date | null>(() => parseToDate(filter?.start_date??null));
  const [endDate, setEndDate] = useState<Date | null>(() => parseToDate(filter?.end_date??null));
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(filter?.tags ?? []);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const queryClient = useQueryClient()
  const tagInfo = useWorkspaceStore(useShallow((s) => s.tagInfo));
  const existingNames = useWorkspaceStore(
    useShallow((s) =>
      Object.values(s.filterInfo)
        .filter((item) => item.id !== filter?.id)
        .map((item) => item.name.trim().toLowerCase())
    )
  );

  useEffect(() => {
    if (filter) {
      setName(filter.name);
      setDescription(filter.description ?? "");
      setPriority(filter.priority);
      setSpecials(filter.specials);
      setStatus(filter.status);
      setStartDate(parseToDate(filter.start_date));
      setEndDate(parseToDate(filter.end_date));
      setSelectedTags(filter.tags ?? []);
      setError(null);
      setDateError(null);
    }
  }, [open, filter]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: any) =>
      filterApi.update(filter?.id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workSpaceKeys.index() })
      toast.success("Đã cập nhật filter");
      onClose();
    },
    onError: () => toast.error("Cập nhật thất bại, thử lại sau"),
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

  const validateDateRange = (start?: Date|null, end?: Date|null) => {
    const startTime = getSafeTime(start);
    const endTime = getSafeTime(end);

    if (startTime && endTime && startTime > endTime) {
      setDateError("Ngày bắt đầu phải trước ngày kết thúc");
    } else {
      setDateError(null);
    }
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date??null);
    validateDateRange(date, endDate);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date??null);
    validateDateRange(startDate, date);
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName]
    );
  };

  const removeTag = (e: React.MouseEvent, tagName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTags((prev) => prev.filter((t) => t !== tagName));
  };

  const buildChangedPayload = (): Partial<IFilterModel> => {
    const payload: Partial<IFilterModel> = {};
    if (!filter) return {};

    const trimmedName = name.trim();
    const trimmedDesc = description.trim();

    if (trimmedName !== filter.name) payload.name = trimmedName;
    if (trimmedDesc !== (filter.description ?? "")) {
      payload.description = trimmedDesc || undefined;
    }
    if (priority !== filter.priority) payload.priority = priority;
    if (specials !== filter.specials) payload.specials = specials;
    if (status !== filter.status) payload.status = status;

    const currentStartTime = getSafeTime(startDate);
    const initialStartTime = getSafeTime(filter.start_date);
    if (currentStartTime !== initialStartTime) {
      payload.start_date = startDate;
    }

    const currentEndTime = getSafeTime(endDate);
    const initialEndTime = getSafeTime(filter.end_date);
    if (currentEndTime !== initialEndTime) {
      payload.end_date = endDate;
    }

    const tagsChanged =
      selectedTags.length !== (filter.tags?.length ?? 0) ||
      selectedTags.some((t) => !filter.tags?.includes(t));
    if (tagsChanged) payload.tags = selectedTags;

    return payload;
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

    const changed = buildChangedPayload();
    if (Object.keys(changed).length === 0) {
      onClose();
      return;
    }
    console.log(changed)
    mutate(changed);
  };

  const handleClose = () => {
    setError(null);
    setDateError(null);
    onClose();
  };

  if (!filter) {
    return null;
  }

  return (
    <Dialog open={!!open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="min-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className={cn("font-bold!")}>Sửa filter</DialogTitle>
            <DialogDescription>
              Cập nhật bộ lọc "{filter.name}".
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-5 py-4">
            <div className="flex flex-col gap-3 w-full">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-bold">Tên filter</Label>
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
                        selectedTags.map((tagName) => {
                          const tag = Object.values(tagInfo).find(
                            (t) => t.name === tagName
                          );
                          if (!tag) return null;
                          return (
                            <Badge
                              key={tagName}
                              variant="secondary"
                              className="rounded! gap-1 pr-1"
                            >
                              {tag.name}
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => removeTag(e, tagName)}
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
                          {Object.values(tagInfo).map((tag) => {
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
                          "rounded! w-full justify-start text-left font-normal relative pr-8",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate
                          ? format(startDate, "dd/MM/yyyy", { locale: vi })
                          : "Chọn ngày"}
                        {startDate && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleStartDateChange(undefined);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-muted-foreground/20 rounded-full p-0.5"
                            aria-label="Xóa ngày bắt đầu"
                          >
                            <X className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate??undefined}
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
                          "rounded! w-full justify-start text-left font-normal relative pr-8",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate
                          ? format(endDate, "dd/MM/yyyy", { locale: vi })
                          : "Chọn ngày"}
                        {endDate && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleEndDateChange(undefined);
                            }}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-muted-foreground/20 rounded-full p-0.5"
                            aria-label="Xóa ngày kết thúc"
                          >
                            <X className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate ?? undefined}
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