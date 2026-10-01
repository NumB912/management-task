// components/lists/menuItems.tsx
import { ReactNode } from "react";
import { ContextMenuItem } from "@/components/ui/context-menu";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { IRoleMember } from "../../model/member.model";

type MenuAction = {
  icon: ReactNode;
  label: string;
  onSelect: () => void;
  role: Array<IRoleMember>;
  destructive?: boolean;
};

type SharedMenuItemsProps = {
  as: "context" | "dropdown";
  role: IRoleMember;
  actions: MenuAction[];
};

export function SharedMenuItems({ role, as, actions }: SharedMenuItemsProps) {
  const Item = as === "context" ? ContextMenuItem : DropdownMenuItem;
  return (
    <>
      {actions.map(
        (action) =>
          action.role.includes(role) && (
            <Item
              key={action.label}
              className="rounded-md p-2!"
              onSelect={action.onSelect}
              variant={action.destructive ? "destructive" : "default"}
            >
              {action.icon}
              <span>{action.label}</span>
            </Item>
          ),
      )}
    </>
  );
}
