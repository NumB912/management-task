"use client"
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface SelectContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedValue: string;
  selectedLabel: string;
  placeHolder: string;
  handleSelect: (value: string, label: string) => void;
}

interface SelectProps {
  children: React.ReactNode;
  defaultValue?: string;
  placeHolder?: string;
  onChange?: (value: string) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error(
      "Select sub-components must be used within a <Select /> component",
    );
  }
  return context;
};

const Trigger = ({ className = "",children }:{ className?: string,children:(props:{placeHolder:string,selectedLabel:string,isOpen:boolean})=>React.ReactNode}) => {
  const { placeHolder, selectedLabel,isOpen, setIsOpen, } = useSelectContext();
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={className}
    >
       {typeof children === "function"
        ? children({selectedLabel, isOpen, placeHolder })
        : (placeHolder)
      }
    </button>
  );
};

const SelectGroup = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { isOpen,selectedLabel } = useSelectContext();
  if (!isOpen) return null;
   useEffect(() => {
    React.Children.forEach(children, (child) => {
      if (child && !React.isValidElement(child)) return;
    });
  }, []); 

  
  return (
    <ul
      className={`absolute mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none ${className}`}
      style={{
        zIndex:9999
      }}
    >
      {children}
    </ul>
  );
};

const Option = ({
  children,
  value,
  className = "",
}: {
  children: string;
  value: string;
  className?: string;
}) => {
  const { selectedValue, handleSelect } = useSelectContext();
  const isSelected = selectedValue === value;

  return (
    <li
      onClick={() => handleSelect(value, children)}
      className={`cursor-pointer select-none py-2 pl-4 pr-4 hover:bg-gray-100 transition-colors ${
        isSelected ? " text-pink-500 font-medium" : "text-gray-900"
      } ${className}`}
    >
      {children}
    </li>
  );
};

const Select = ({
  children,
  defaultValue = "",
  placeHolder = "Select an option...",
  onChange,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const selectRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string, label: string) => {
    setSelectedValue(value);
    setSelectedLabel(label);
    setIsOpen(false);
    if (onChange) onChange(value);
  };

  return (
    <SelectContext.Provider
      value={{ isOpen, setIsOpen, selectedValue, selectedLabel, handleSelect, placeHolder }}
    >
      <div ref={selectRef} className="relative min-w-[200px] w-full text-sm">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

Select.Trigger = Trigger;
Select.Option = Option;
Select.SelectGroup = SelectGroup;

export default Select;