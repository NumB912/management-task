import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid h-screen overflow-hidden w-screen items-center justify-center bg-neutral-50/40">
     {children}
    </div>
  );
};

export default layout;
 