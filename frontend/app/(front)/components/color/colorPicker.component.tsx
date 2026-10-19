"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DEFAULT_COLORS } from "../../model/mod/color.config";
import SimpleColorPicker from "./advancePickColor.component";


interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  colors?: string[];
  inline?: boolean;
  className?: string;
}

export default function ColorPicker({
  value,
  onChange,
  colors = DEFAULT_COLORS,
  inline = false,
  className,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const content = (
    <div className={cn("grid gap-4", className)}>
      <section className="grid gap-2" aria-label="Màu mặc định">
        <p className="text-sm font-medium">Màu mặc định</p>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onChange(c);
                if (!inline) setOpen(false);
              }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-transform hover:scale-110"
              style={{ backgroundColor: c }}
              aria-label={`Màu ${c}`}
              aria-pressed={value === c}
            >
              {value === c && <Check className="h-4 w-4 text-white" />}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-2 border-t pt-3" aria-label="Màu tùy chỉnh">
        <p className="text-sm font-medium">Màu tùy chỉnh</p>
        <SimpleColorPicker value={value} onChange={onChange} />
      </section>
    </div>
  );

  if (inline) {
    return content;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 p-2! font-normal text-neutral-700! justify-start"
        >
          <span
            className="h-4 w-4 rounded-full border shrink-0"
            style={{ backgroundColor: value ?? "#E5E7EB" }}
          />
          <span>{value ? value : "Chọn màu"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">{content}</PopoverContent>
    </Popover>
  );
}
