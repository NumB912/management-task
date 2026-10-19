// components/entity-row/shared-menu-items.tsx
import { Fragment } from "react";

import {
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import type { MenuActionGroup } from "./types";
import { DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";

interface SharedMenuItemsProps {
  as: "dropdown" | "context";
  groups: MenuActionGroup[];
}

export function SharedMenuItems({ as, groups }: Readonly<SharedMenuItemsProps>) {
  const Item = as === "dropdown" ? DropdownMenuItem : ContextMenuItem;
  const Separator = as === "dropdown" ? DropdownMenuSeparator : ContextMenuSeparator;

  return (
    <>
      {groups.map((group, groupIndex) => (
        <Fragment key={groupIndex}>
          {group.map((action) => (
            <Item
              key={action.label}
              onClick={(e)=>{
                e.stopPropagation()
                action.onClick()
              }}
              className={cn(`flex items-center group/list-item w-full p-2!`)}
            >
              {action.icon}
              {action.label}
            </Item>
          ))}
          {groupIndex < groups.length - 1 && <Separator />}
        </Fragment>
      ))}
    </>
  );
}