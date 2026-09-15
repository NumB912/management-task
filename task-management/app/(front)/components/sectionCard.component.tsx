"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/app/(front)/components/ui/card";
import { Button } from "@/app/(front)/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface CollapsibleCardProp {
  title: string;
  count: number;
  onPlusClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

export const SectionCard = ({ title, count, onPlusClick, children }: CollapsibleCardProp) => {
  return (
    <div className={`${"max-w-xs min-h-0 h-full max-h-xs"}`}>
        <Card className={cn("ring-0 rounded-0 max-w-xs! gap-2 px-0 min-h-0 h-full")}>
            <CardHeader className="font-bold flex items-center text-md gap-1 justify-between z-50 cursor-pointer">
              <span className="flex gap-2 items-center">
                <span className="flex items-center">{title}</span>
                <span className={cn("text-neutral-400 font-normal")}>{count}</span>
              </span>
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
            </CardHeader>
            <CardContent
              className={cn(
                "p-0! gap-0.5 flex flex-col items-center",
    "overflow-x-hidden overflow-y-auto",
    "max-h-[min(50vh,500px)] max-w-[min(40vw,500px)] min-w-65 w-full"
              )}
            >
              {children}
            </CardContent>

        </Card>
    </div>
  );
};