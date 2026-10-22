"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/app/(front)/components/ui/card";
import { Button } from "@/app/(front)/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface CollapsibleCardProp {
  title: string;
  count: number;
  onPlusClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  responsive?: boolean;
}

export const SectionCard = ({
  title,
  count,
  onPlusClick,
  children,
  responsive = false,
}: CollapsibleCardProp) => {
  return (
    <div className={responsive ? "min-w-0 w-full" : "max-w-xs min-h-0 h-full max-h-xs"}>
      <Card
        className={cn("ring-0 rounded-0 gap-2 p-2 min-h-0 h-full", responsive ? "w-full min-w-0" : "max-w-xs!")}
      >
        <CardHeader className="font-bold flex items-center text-md gap-1 justify-between z-50 cursor-pointer">
          <span className="flex min-w-0 gap-2 items-center">
            <span className="min-w-0 truncate">{title}</span>
            <span className={cn("text-neutral-400 font-normal")}>{count}</span>
          </span>
          {onPlusClick && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onPlusClick(e);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              className="rounded hover:bg-gray-200 p-1 text-nessutral-600 cursor-pointer relative bg-transparent"
            >
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent
          className={cn(
            "gap-0.5 flex flex-col items-center px-0",
            "overflow-y-auto",
            responsive
              ? "max-h-[min(60dvh,500px)] min-w-0 w-full"
              : "max-h-[min(50vh,500px)] max-w-[min(40vw,500px)] min-w-65 w-full",
          )}
        >
          {children}
        </CardContent>
      </Card>
    </div>
  );
};
