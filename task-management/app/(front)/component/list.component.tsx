"use client";
import Link from "next/link";
import React, { useState } from "react";
import { useActiveLink } from "../hooks/useActiveName.hooks";
import ListDropDown from "./ui/list.component";
type FilterItem = {
  id: string;
  label: string;
  href?: string;
  onMoreClick?: () => void;
};

type CollapsibleFilterProps = {
  title?: string;
  items: FilterItem[];
  onAddClick?: () => void;
  defaultOpen?: boolean;
};

const CollapsibleFilter = ({
  title = "Danh sách",
  items,
  onAddClick,
  defaultOpen = false,
}: CollapsibleFilterProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const isActive = useActiveLink();
  return (
    <div className="flex flex-col mt-1">
      <button
        className="flex gap-2 hover:bg-gray-100 p-2 cursor-pointer rounded group"
        onClick={() => setIsOpen((v) => !v)}
      >
        <div className="w-full flex justify-between items-center">
          <div className="flex gap-0.5 items-center justify-center">
            <span className="text-gray-500 text-xs font-bold group-hover:text-gray-600">
              {title}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`size-3 text-gray-400 hidden group-hover:block group-hover:text-gray-600 transition-transform duration-200 ${
                isOpen ? "rotate-0" : "-rotate-90"
              }`}
            >
              <path
                fillRule="evenodd"
                d="M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <div className="opacity-0 cursor-pointer hover:bg-gray-200 hover:text-gray-800 p-1 rounded group-hover:opacity-100 transition-opacity duration-150">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4 text-gray-500"
            >
              <path
                fillRule="evenodd"
                d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </button>

      <ListDropDown isOpen={isOpen}>
        <div
          className={`pl-2 w-full overflow-hidden transition-all duration-200 ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href ?? "/"}
              className={`flex justify-between items-center p-2 group/item w-full rounded cursor-pointer  ${isActive(item.href ?? "/") ? "bg-pink-100/60 text-pink-700" : "text-gray-700 hover:bg-gray-200/50"}
           `}
            >
              <span className="text-sm ">{item.label}</span>
              <button
                className="group-hover/item:block hidden rounded hover:bg-gray-200 p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4 "
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Zm6 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </Link>
          ))}
        </div>
      </ListDropDown>
    </div>
  );
};

export default CollapsibleFilter;
