"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/app/(front)/components/ui/card";
import { Button } from "@/app/(front)/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
            <CardHeader className="font-bold flex text-md gap-1 justify-between z-50 cursor-pointer">
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
                className="rounded hover:bg-gray-200 p-1 text-neutral-600 cursor-pointer relative bg-transparent"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent
              className={cn(
                "p-0! overflow-auto overflow-y-auto gap-0.5 flex flex-col items-center cursor-grab min-h-0",
                "max-h-[min(60vh,500px)] w-full min-w-[40vh]",
                "sm:max-h-[min(70vh,700px)] sm:max-w-lg!",
                "lg:max-h-[min(79vh,900px)] lg:max-w-md!",
              )}
            >
              {children}
            </CardContent>

        </Card>
    </div>
  );
};