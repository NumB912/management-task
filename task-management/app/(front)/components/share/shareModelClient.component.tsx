"use client";
import { cn } from "@/lib/utils";
import { useShareModalStore } from "../../feature/store/share/share.state";
import { useWorkspaceStore } from "../../feature/store/workspace.state";
import { ShareContent } from "./shareContent.component";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";
export function ShareModalClient() {
  const { close, isOpen, listId } = useShareModalStore();
  const { listIndex } = useWorkspaceStore();
  if (!listId) return;
  const list = listIndex[listId];
  if (!list) {
    return;
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
    >
      <SheetContent
        side="right"
        className="w-1/3 mt-20 mr-10 border rounded-lg max-h-100"
      >
        <SheetHeader className="p-4 pb-0">
          <SheetTitle className={cn("text-lg font-bold")}>
            Share ({list.name})
          </SheetTitle>
        </SheetHeader>
        <ShareContent key={listId} listId={listId ?? ""} />
      </SheetContent>
    </Sheet>
  );
}
