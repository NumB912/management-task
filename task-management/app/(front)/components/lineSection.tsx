import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { cn } from "@/lib/utils";

const LineSection = ({children,header}:{children:React.ReactNode,header:React.ReactNode}) => {
  return (
      <Card  className={cn("ring-0 rounded-0 min-w-xs! bg-black/5 mt-2")}>
        <CardContent className="h-205 overflow-y-auto flex flex-col cursor-grab overflow-clip min-w-xs!">
            {children}
        </CardContent>
      </Card>
  );
};

export default LineSection;
