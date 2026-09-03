import React from "react";

interface ListDropDownProp {
  isOpen: boolean;
  children: React.ReactNode;
}

const ListDropDown = ({ isOpen, children }: ListDropDownProp) => {
  return (
    <div
      className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
    >
      <div className="flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ListDropDown;
