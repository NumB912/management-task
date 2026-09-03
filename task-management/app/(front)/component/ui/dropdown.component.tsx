import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type position = "left" | "center" | "right";
export type horizontal = "top" | "bottom" | "same";
interface DropdownMenuProps {
  trigger?: React.ReactNode;
  children: React.ReactNode;
  position?: position;
  horizontal?: horizontal;
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
}

const Dropdown = ({
  trigger,
  children,
  setIsOpen,
  isOpen,
  position = "center",
  horizontal = "bottom",
}: DropdownMenuProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [coor, setCoor] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  useEffect(() => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (rect) {
      setCoor({
        x:
          position == "left"
            ? rect.left
            : position == "right"
              ? rect.right
              : (rect.left + rect.right) / 2,
        y:
          horizontal == "bottom"
            ? rect.bottom
            : horizontal == "top"
              ? rect.top
              : rect.top,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);
  return (
    <div className={`relative`} ref={wrapperRef} style={{zIndex:10}}>
      {trigger && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="cursor-pointer h-full "
        >
          {trigger}
        </div>
      )}

      {isOpen &&
        createPortal(
          <div
            ref={dropRef}
            className={`z-90 fixed min-w-48 w-fit bg-white border border-gray-200 rounded shadow-sm`}
            style={{
              left: coor.x,
              top: coor.y + (horizontal === "top" ? -6 : 6),
              transform: `translateX(${position === "left" ? "0%" : position === "right" ? "-100%" : "-50%"}) translateY(${horizontal == "top" ? "-100%" : "0%"})`,
            }}
          >
            {children}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default Dropdown;
