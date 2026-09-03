import { Input } from "@/components/ui/input";
import React, { useEffect, useRef } from "react";

interface InputTextProp {
  value: string;
  setValue: (value: string) => void;
  doneHandle: () => void;
  closeHandle: () => void;
  placeholder?: string;
}

const InputText = ({
  value,
  setValue,
  doneHandle,
  closeHandle,
  placeholder = "Nhập tên...",
}: InputTextProp) => {
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        inputWrapperRef.current &&
        !inputWrapperRef.current.contains(e.target as Node)
      ) {
        if (valueRef.current.trim() === "") {
          closeHandle();
        } else {
          doneHandle();
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [closeHandle,doneHandle]);

  function keyHandlerInputSection(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      doneHandle();
    } else if (e.key === "Escape") {
      closeHandle();
    }
  }

  return (
    <div ref={inputWrapperRef}>
    <div>
            <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={keyHandlerInputSection}
        className="w-full py-2 text-md text-gray-700 bg-transparent outline-none border-b transition-colors"
      />
    </div>
      <p className="text-xs text-gray-400 mt-1">Enter để lưu · Esc để huỷ</p>
    </div>
  );
};

export default InputText;
