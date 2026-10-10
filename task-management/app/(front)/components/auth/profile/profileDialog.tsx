"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Label } from "../../ui/label";
import { useUpdateProfile } from "@/app/(front)/feature/hook/useUpdateProfile.Mutate";
import useUserState from "@/app/(front)/states/user/user.state";
import { MAX_VALUE_REG } from "recharts/types/util/ChartUtils";
import AvatarEditor from "../../avatar.component";
import { FileConfig } from "@/app/(front)/config/file.config";
export function getInitials(name: string, email: string) {
  const parts = (name.trim() || email).split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const NAME_MAX = 50;
const DEBOUNCE_MS = 800;

type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface ProfileDialogProps {
  name: string;
  email: string;
  avatar?: string | null;
  children?: React.ReactNode;
   open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onLogout?: () => void | Promise<void>;
}

const ProfileDialog = ({
  name,
  email,
  avatar,
  children,
  open,
  onOpenChange,
  onLogout,
}: ProfileDialogProps) => {
  const nameId = useId();
  const [draft, setDraft] = useState(name);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const {setUser} = useUserState()
  const [loggingOut, setLoggingOut] = useState(false);
  const {mutate:update} = useUpdateProfile()
  

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setDraft(value);
    setTouched(true);
    setStatus("idle");
  }

  async function handleUpdateFile(file:File){
    
  }

  async function handleSubmit(){

    setUser({
      name:draft
    })
    update({
      name:draft
    },{
      onError(error, variables, onMutateResult, context) {
        
      },
      onSuccess(data, variables, onMutateResult, context) {
        
      },
    })
  }
  
  useEffect(()=>{
    if(draft.length==0||draft.length >= NAME_MAX) return
    const fn = setTimeout(()=>{
        handleSubmit()
    },DEBOUNCE_MS)

    return ()=>{
      clearTimeout(fn)
    }
  },[draft])

  function handleOpenChange(next: boolean) {
    if (next) {
      setDraft(name);
      setTouched(false);
      setStatus("idle");
    } 
    onOpenChange?.(next);
  }

  async function handleLogout() {
    if (!onLogout) return;
    setLoggingOut(true);
    try {
      await onLogout();
      onOpenChange?.(false);
    } finally {
      setLoggingOut(false);
    }
  }



  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent className="sm:max-w-xl shadow-2xs">
        <DialogHeader>
          <DialogTitle className="sr-only">Hồ sơ</DialogTitle>
          <DialogDescription className="sr-only">
            Thông tin tài khoản của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-10 py-2">
          <div className="flex flex-col gap-2 items-center">
            <div className="w-full">
                <AvatarEditor name={name} avatar={avatar} className="" onRemove={()=>{}} onUpload={()=>{}}/>

            </div>
           <div className="flex flex-col gap-2">
              <div className="text-muted-foreground text-xs">
                Hình ảnh chỉ được có kích cỡ từ 0Mb tới 4Mb thôi
              </div>
            </div>
          </div>
          <div className="w-full space-y-4 text-sm">
            <div className="space-y-1.5">
              <Label htmlFor={nameId} className="font-bold">
                Tên
              </Label>
              <Input
                id={nameId}
                value={draft}
                onChange={handleChange}
                onKeyDown={(e) => e.key === "Enter"}
                maxLength={NAME_MAX}
                autoComplete="name"
                className="rounded bg-transparent! p-2! mt-1"
                aria-invalid={status === "error"}
                aria-describedby={`${nameId}-hint`}
              />
              <div className="flex w-full justify-end">
                  <span className="text-muted-foreground text-sm">{draft.length}/{NAME_MAX}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold">Email</span>
              <p className="truncate font-light mt-1">{email}</p>
            </div>
          </div>
        </div>

        {onLogout && (
          <DialogFooter className="bg-transparent p-2">
            <Button
              variant="destructive"
              className="border! bg-transparent! hover:bg-neutral-300!"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileDialog;
