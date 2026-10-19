import { usePathname } from "next/navigation";

export const useActiveLink = () => {
  const pathname = usePathname();
  return (href: string, exact: boolean = true) => {
    return exact ? pathname === href : pathname.startsWith(href);
  };
};
