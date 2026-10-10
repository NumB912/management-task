"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, ImageUp, Loader2, Pencil, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { getInitials } from "../utils/actor.utils";
import { FileConfig } from "../config/file.config";

const MAX_SIZE = 4 * 1024 * 1024; // 2 MB
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
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const src = preview ?? avatar ?? undefined;
  const hasAvatar = !!src;
  const editable = !!onUpload;
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);
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
      setError("Ảnh tối đa 2 MB.");
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));
    setBusy("upload");
    try {
      await onUpload(file);
    } catch {
      setError("Không tải ảnh lên được. Vui lòng thử lại.");
    } finally {
      setPreview(null); 
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
    "absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full",
    "bg-black/50 text-xs font-medium text-white outline-none",
    "opacity-0 transition-opacity",
    "group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100",
    "focus-visible:ring-2 focus-visible:ring-ring"
  );
  console.log(`${FileConfig.FILE_URL}${src}`)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("group relative rounded-full", className)}>
        <Avatar className="size-30">
          <AvatarImage src={`${FileConfig.FILE_URL}${src}`} alt={`avatar-${name}`} />
          <AvatarFallback className="text-xl">
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
                  <Pencil className="size-5" />
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
            // Chưa có ảnh -> "Thêm", bấm vào mở chọn file / no image -> "Thêm", opens the file picker
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

        {/* Màn hình cảm ứng không có hover nên luôn hiện một huy hiệu nhỏ */}
        {/* Touch screens have no hover, so always show a small badge */}
        {editable && !busy && (
          <span
            aria-hidden
            className="pointer-events-none absolute right-0 bottom-0 hidden size-8 items-center justify-center rounded-full border bg-background shadow-sm [@media(hover:none)]:flex"
          >
            {hasAvatar ? <Pencil className="size-4" /> : <Camera className="size-4" />}
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