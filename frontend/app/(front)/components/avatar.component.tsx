"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImageUp, Loader2, Pencil, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { getInitials } from "../utils/actor.utils";
import { resolveSrc } from "../utils/readURL.utils";

const MAX_SIZE_MB = 4;
const MAX_SIZE = MAX_SIZE_MB * 1024 * 1024;
const ACCEPT = ["image/png", "image/jpeg", "image/webp"];

export interface AvatarEditorProps {
  name: string;
  avatar?: string | null;
  onUpload?: (file: File) => void | Promise<void>;
  onRemove?: () => void | Promise<void>;
  className?: string;
}

const AvatarEditor = ({
  name,
  avatar,
  onUpload,
  onRemove,
  className = "size-30",
}: AvatarEditorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageSrc = resolveSrc(avatar);
  const hasAvatar = !!imageSrc;
  const editable = !!onUpload;
  function pickFile() {
    inputRef.current?.click();
  }
  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onUpload) return;
    if (!ACCEPT.includes(file.type)) {
      setError("Chỉ hỗ trợ ảnh PNG, JPG hoặc WebP.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(`Ảnh tối đa ${MAX_SIZE_MB} MB.`);
      return;
    }

    setError(null);
    setBusy("upload");
    try {
      await onUpload(file);
    } catch {
      setError("Không tải ảnh lên được. Vui lòng thử lại.");
    } finally {
      setBusy(null);
    }
  }

  async function handleRemove() {
    if (!onRemove) return;
    setError(null);
    setBusy("remove");
    try {
      await onRemove();
    } catch {
      setError("Không xóa được ảnh. Vui lòng thử lại.");
    } finally {
      setBusy(null);
    }
  }

  const overlayClass = cn(
    "absolute inset-0 flex flex-col items-center justify-center gap-1  rounded-full",
    "bg-black/50 text-xs font-medium text-white outline-none",
    "opacity-0 transition-opacity",
    "group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
    "focus-visible:ring-2 focus-visible:ring-ring"
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("group relative rounded-full", className)}>
        <Avatar className="size-full max-w-sm">
          <AvatarImage src={imageSrc} alt={`avatar-${name}`} className=" object-cover max-w-40! min-w-20! w-full aspect-square"/>
          <AvatarFallback className="text-xl bg-blue-100 w-40 max-w-sm aspect-square">
            {getInitials(name)} 
          </AvatarFallback>
        </Avatar>

        {editable &&
          (hasAvatar ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Chỉnh sửa ảnh đại diện"
                  disabled={!!busy}
                  className={overlayClass}
                >
                  <Pencil className="size-5 " />
                  Sửa
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem onSelect={pickFile}>
                  <ImageUp />
                  Chọn ảnh khác
                </DropdownMenuItem>
                {onRemove && (
                  <DropdownMenuItem
                    onSelect={handleRemove}
                    className="text-destructive focus:text-destructive"
                  >
                    <X className="text-destructive" />
                    Xóa ảnh
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              type="button"
              aria-label="Thêm ảnh đại diện"
              disabled={!!busy}
              onClick={pickFile}
              className={overlayClass}
            >
              <Camera className="size-5" />
              Thêm
            </button>
          ))}

        {editable && !busy && (
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-0 hidden size-8 items-center justify-center rounded-full border bg-background shadow-sm [@media(hover:none)]:flex"
          >
            {hasAvatar ? (
              <Pencil className="size-4" />
            ) : (
              <Camera className="size-4" />
            )}
          </span>
        )}

        {busy && (
          <div
            role="status"
            aria-label={busy === "upload" ? "Đang tải ảnh lên" : "Đang xóa ảnh"}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white"
          >
            <Loader2 className="size-6 animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};

export default AvatarEditor;