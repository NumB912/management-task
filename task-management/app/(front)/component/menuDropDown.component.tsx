import { useEffect, useRef, useState } from "react";
import Dropdown, { horizontal, position } from "./ui/dropdown.component";

interface MenuItem {
  label: string;
  icon: string;
  danger?: boolean;
  onClick: () => void;
}

interface MenuGroup {
  groupLabel?: string;
  items: MenuItem[];
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  groups: MenuGroup[];
  className?: string;
  horizontal?: horizontal;
  vertical?: position;
}

const DropdownMenu = ({
  trigger,
  groups,
  className,
  horizontal,
  vertical,
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Dropdown
      horizontal={horizontal}
      position={vertical}
      setIsOpen={setIsOpen}
      isOpen={isOpen}
      trigger={trigger}
    >
      <div onMouseDown={(e) => e.stopPropagation()} className={className}>
        {groups.map((group, gi) => (
          <div key={gi}>
            {gi > 0 && <div className="h-px bg-gray-100 my-1" />}
            {group.groupLabel && (
              <p className="px-2 pt-1 pb-0.5 text-[11px] uppercase tracking-wider text-gray-400">
                {group.groupLabel}
              </p>
            )}
            {group.items.map((item, ii) => (
              <button
                key={ii}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-lg transition-colors cursor-pointer
                    ${
                      item.danger
                        ? "text-red-600 hover:bg-red-50"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
              >
                <i className={`ti ${item.icon} text-base`} />
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>
    </Dropdown>
  );
};

export default DropdownMenu;
