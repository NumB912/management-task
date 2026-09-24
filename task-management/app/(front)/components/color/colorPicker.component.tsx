"use client";

import { useState } from "react";
import { Check, Palette } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import AdvancedColorPicker from "./advancePickColor.component";
import { DEFAULT_COLORS } from "../../model/mod/color.config";
import SimpleColorPicker from "./advancePickColor.component";


interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  colors?: string[];
  inline?: boolean;
  allowCustom?: boolean;
  className?: string;
}

export default function ColorPicker({
  value,
  onChange,
  colors = DEFAULT_COLORS,
  inline = false,
  allowCustom = false,
  className,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  const swatches = (
    <div className={cn("flex flex-wrap flex-col gap-2", className)}>
    <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => {
            onChange(c);
            setOpen(false);
          }}
          className="h-7 w-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shrink-0"
          style={{ backgroundColor: c }}
          aria-label={c}
        >
          {value === c && <Check className="h-4 w-4 text-white" />}
        </button>
      ))}
    </div>

      {allowCustom && (
        <label className="h-7 w-7 rounded-full border border-dashed border-neutral-300 flex items-center justify-center cursor-pointer relative shrink-0 overflow-hidden">
          <Palette className="h-3.5 w-3.5 text-neutral-400" />
          <input
            type="color"
            value={value ?? "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
      )}
      <SimpleColorPicker value={value} onChange={(hex) => onChange(hex)} />
    </div>
  );

  if (inline) {
    return swatches;
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
      <PopoverContent className="w-auto p-3">{swatches}</PopoverContent>
    </Popover>
  );
}
