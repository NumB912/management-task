"use client";
import { useRouter } from "next/navigation";
import { Children, useEffect, useRef, useState } from "react";
interface ModalProps {
  children: React.ReactNode;
}

export default function Modal({ children }: ModalProps) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === wrapperRef.current) {
      router.back();
    }
  };

  return (
    <div
      ref={wrapperRef}
      onClick={handleBackdropClick}
      className="fixed top-0 left-0 z-9999 max-h-screen max-w-screen w-full h-full flex items-center justify-center bg-gray-600/10"
    >
      <div
        className="min-w-xs w-fit bg-white rounded"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
