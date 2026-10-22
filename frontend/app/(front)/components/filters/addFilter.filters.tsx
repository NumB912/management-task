"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
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
import { useWorkspaceStore } from "../../feature/store/workspace.state";
import { useShallow } from "zustand/react/shallow";
import { Ipriority, ISpecials, IStatus } from "../../model/type/type";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Calendar } from "../ui/calendar";
import { filterApi } from "../../feature/api/filters/filter.api";
import { Label } from "../ui/label";
import TagCombobox from "../tagCompobox";
import { Badge } from "@/components/ui/badge";
import { PRIORITY_OPTIONS, SPECIALS_OPTIONS, STATUS_OPTIONS } from "./editFilter.filters";
import ObjectID from "bson-objectid";
import useUserState from "../../feature/store/user/user.state";
import { IFilterModel } from "../../model/filter.model";
import { FilterPropertyItem } from "./filterPropertyItem";
import ColorPicker from "../color/colorPicker.component";
import { DEFAULT_COLORS } from "../../model/mod/color.config";

interface addFilterDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddFilterDialog({ open, onClose }: Readonly<addFilterDialogProps>) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Ipriority | null>(null);
  const [specials, setSpecials] = useState<ISpecials>("none");
  const [status, setStatus] = useState<IStatus>("pending");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const addFilter = useWorkspaceStore((state)=>state.addFilter)
  const {user} = useUserState()
  const queryClient = useQueryClient();

  const existingNames = useWorkspaceStore(
    useShallow((s) =>
      Object.values(s.filterIndex).map((item) =>
        item.name.trim().toLowerCase()
      )
    )
  );

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(null);
      setDateError(null);
    }
  }, [open]);

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: IFilterModel) => filterApi.create(payload),
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
    setColor(DEFAULT_COLORS[0]);
    setDescription("");
    setPriority(null);
    setSpecials("none");
    setStatus("pending");
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedTags([]);
    setTagPopoverOpen(false);
    setError(null);
    setDateError(null);
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
    const id = new ObjectID().toString();
    addFilter({
      name: trimmed,
      color,
      description: description.trim() || undefined,
      priority: priority,
      specials,
      status,
      start_date: startDate,
      end_date: endDate,
      tags: selectedTags ?? [],
      id,
      user:user?.id??""
    })
    mutate({
      name: trimmed,
      color,
      description: description.trim() || undefined,
      priority: priority,
      specials,
      status,
      start_date: startDate,
      end_date: endDate,
      tags: selectedTags ?? [],
      id,
      user:user?.id??""
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="h-dvh max-h-dvh w-full min-w-0 max-w-none content-start overflow-y-auto rounded-none p-4 sm:h-auto sm:max-h-[90dvh] sm:w-[calc(100%-2rem)] sm:max-w-2xl sm:rounded-xl sm:p-6">
        <form onSubmit={handleSubmit} className="min-w-0">
          <DialogHeader>
            <DialogTitle className={cn("font-bold!")}>Thêm filter</DialogTitle>
            <DialogDescription>
              Tạo bộ lọc mới để tổ chức công việc của bạn.
            </DialogDescription>
          </DialogHeader>

          <div className="grid min-w-0 grid-cols-1 gap-5 py-4 sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-3 w-full">
              <FilterPropertyItem label="Màu filter" value={color}>
<div className="grid gap-2">
                <Label>Màu filter</Label>
                <ColorPicker value={color} onChange={setColor} />
              </div>
</FilterPropertyItem>
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

            <div className="flex min-w-0 flex-wrap gap-2 sm:flex-col sm:gap-5">
                    <FilterPropertyItem label="Độ ưu tiên" value={priority == null ? undefined : PRIORITY_OPTIONS.find((option) => option.value === priority)?.label}>
<div className="grid gap-2">
                      <Label className="font-bold">Độ ưu tiên</Label>
                      <ToggleGroup
                        type="single"
                        className="flex w-full flex-wrap gap-1"
                        value={priority?.toString() ?? "none"}
                        onValueChange={(v) =>
                          setPriority(v !== "none" ? (Number(v) as Ipriority) : null)
                        }
                      >
                        {PRIORITY_OPTIONS.map((p) => (
                          <ToggleGroupItem
                            key={p.label}
                            value={p.value?.toString() ?? "none"}
                            className={cn("border! rounded!", p.className)}
                          >
                            {p.label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </div>
</FilterPropertyItem>
            <FilterPropertyItem label="Thẻ" value={selectedTags.length ? selectedTags.join(", ") : undefined}>
<div className="grid gap-2">
              <Label className="font-bold">Thẻ</Label>
              <TagCombobox
                  open={tagPopoverOpen}
                  onOpenChange={setTagPopoverOpen}
                  selectedTags={selectedTags}
                  onConfirm={setSelectedTags}
                  isPending={isPending}
                  placeholder="Tìm thẻ..."
                  emptyText="Không tìm thấy thẻ nào."
                  className="w-(--radix-dropdown-menu-trigger-width) max-w-[calc(100vw-2rem)] p-0"
                  trigger={
                    <button
                      type="button"
                      aria-label="Chọn thẻ"
                      aria-expanded={tagPopoverOpen}
                      disabled={isPending}
                      className={cn(
                        "border-input rounded! w-full min-h-9 flex flex-wrap items-center gap-1 px-3 py-1.5 text-sm text-left border cursor-pointer",
                        "focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none disabled:opacity-50",
                        selectedTags.length === 0 && "text-muted-foreground"
                      )}
                    >
                      {selectedTags.length === 0
                        ? "Chọn thẻ"
                        : selectedTags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="max-w-full whitespace-normal wrap-anywhere rounded!"
                            >
                              {tag}
                            </Badge>
                          ))}
                    </button>
                  }
                />
            </div>
</FilterPropertyItem>
            <FilterPropertyItem label="Thời gian đặc biệt" value={specials === "none" ? undefined : SPECIALS_OPTIONS.find((option) => option.value === specials)?.label}>
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
</FilterPropertyItem>

            <FilterPropertyItem label="Trạng thái" value={STATUS_OPTIONS.find((option) => option.value === status)?.label}>
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
</FilterPropertyItem>

            <div className="contents sm:grid sm:grid-cols-1 sm:gap-3">
              <FilterPropertyItem label="Ngày bắt đầu" value={startDate ? format(startDate, "dd/MM/yyyy", { locale: vi }) : undefined}>
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
</FilterPropertyItem>

              <FilterPropertyItem label="Ngày kết thúc" value={endDate ? format(endDate, "dd/MM/yyyy", { locale: vi }) : undefined}>
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
</FilterPropertyItem>
              {dateError && (
                <p className="text-sm text-destructive">{dateError}</p>
              )}
            </div>
            </div>
          </div>

          <DialogFooter className={cn("bg-transparent! p-0! border-t-0 mt-3 gap-2 [&>button]:min-h-10")}>
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
