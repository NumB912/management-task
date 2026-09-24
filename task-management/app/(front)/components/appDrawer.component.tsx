"use client";

import * as React from "react";

import {
  Drawer as DrawerPrimitive,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  hideHeader?: boolean;
  direction?: "right" | "left" | "bottom" | "top";
  className?: string;
  children: React.ReactNode;
}

export default function AppDrawer({
  open,
  onOpenChange,
  title,
  hideHeader = false,
  direction = "right",
  className,
  children,
}: AppDrawerProps) {
  const isSide = direction === "right" || direction === "left";

  return (
    <DrawerPrimitive open={open} onOpenChange={onOpenChange} direction={direction}>
      <DrawerContent
        className={cn(
          "flex flex-col p-0 gap-0",
          isSide && "h-full w-full sm:max-w-md",
          direction === "right" && "ml-auto rounded-l-lg",
          direction === "left" && "mr-auto rounded-r-lg",
          !isSide && "max-h-[90vh] rounded-t-lg",
          className,
        )}
      >
        {hideHeader ? (
          <DrawerHeader className="sr-only">
            <DrawerTitle>{title ?? "Drawer"}</DrawerTitle>
          </DrawerHeader>
        ) : (
          <DrawerHeader className="flex items-center justify-between border-b p-4">
            <DrawerTitle className="text-base font-semibold">
              {title}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-fit w-fit">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </DrawerHeader>
        )}

        <div className="flex-1 overflow-y-auto relative">
          {hideHeader && (
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-fit w-fit z-10"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          )}
          {children}
        </div>
      </DrawerContent>
    </DrawerPrimitive>
  );
}