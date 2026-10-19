"use client";

interface SimpleColorPickerProps {
  value?: string;
  onChange: (hex: string) => void;
}

export default function SimpleColorPicker({
  value = "#000000",
  onChange,
}: SimpleColorPickerProps) {

  return (
    <label className="flex items-center gap-2 border rounded-md p-2 cursor-pointer w-fit">
      <div
        className="h-6 w-6 rounded-full border relative overflow-hidden shrink-0"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <span className="text-sm font-mono">{value}</span>
    </label>
  );
}