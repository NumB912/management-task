import { MenuActionGroup } from "./types";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { SharedMenuItems } from "./shared-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface EntityRowProps {
  icon: React.ReactNode;
  name: string;
  actionGroups: MenuActionGroup[];
  link: string;
}

export default function EntityRow({
  icon,
  name,
  actionGroups,
  link,
}: Readonly<EntityRowProps>) {
  const pathName = usePathname();
  const isActive = pathName === link;
  return (
    <ContextMenu>
      <ContextMenuTrigger
        asChild
        className={cn(
          `h-fit`,
        )}
        onClick={(e)=>{e.stopPropagation()}}
      >
        <Link href={link}>
          <div
            className={cn(
              `w-full rounded-md hover:bg-primary/10! group/list-item flex justify-between items-center p-2 cursor-default ${isActive ? "bg-white/80! text-primary hover:bg-bg-white/80!" : "hover:bg-primary/10! hover:text-black"}`,
            )}
          >
            <span className="flex items-center gap-2 pl-1">
              {icon}
              <span className="flex items-center gap-1 text-sm">{name}</span>
            </span>

            <span className="flex items-center gap-2 relative">
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={cn(
                    `group-hover/list-item:visible invisible absolute right-0`,
                  )}
                >
                  <span className="hover:text-primary!">
                    <MoreHorizontal size={16} />
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" sideOffset={10}>
                  <SharedMenuItems as="dropdown" groups={actionGroups} />
                </DropdownMenuContent>
              </DropdownMenu>
            </span>
          </div>
        </Link>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <SharedMenuItems as="context" groups={actionGroups} />
      </ContextMenuContent>
    </ContextMenu>
  );
}
