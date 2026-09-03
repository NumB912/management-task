// components/lists/menuItems.tsx
import { ReactNode } from "react";
import { ContextMenuItem } from "@/components/ui/context-menu";
import { DropdownMenuItem } from "../ui/dropdown-menu";

type MenuAction = {
  icon: ReactNode;
  label: string;
  onSelect: () => void;
  destructive?: boolean;
};

type SharedMenuItemsProps = {
  as: "context" | "dropdown";
  actions: MenuAction[];
};

export function SharedMenuItems({ as, actions }: SharedMenuItemsProps) {
  const Item = as === "context" ? ContextMenuItem : DropdownMenuItem;

  return (
    <>
      {actions.map((action) => (
        <Item
          key={action.label}
          className="rounded-md p-2!"
          onSelect={action.onSelect}
        >
          {action.icon}
          <span>{action.label}</span>
        </Item>
      ))}
    </>
  );
}