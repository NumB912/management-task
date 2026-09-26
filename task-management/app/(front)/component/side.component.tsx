"use client";
import { Calendar, Clock, Home, List } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useUserState from "../states/user/user.state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import NotificationBell from "../components/notifier/notificationBell";

const Side = () => {
  const apiUrl = `${process.env.NEXT_PUBLIC_NOTIFICATION_URL}notifications/stream`
  const pathName = usePathname();
  const { user } = useUserState();
  const navItems = [
    { href: "/dashboard", label: "Dashboard", Icon: Home, exact: true },
    {
      href: "/dashboard/work/inbox",
      label: "Work",
      Icon: List,
      activeMatch: "/dashboard/work",
    },
    { href: "/dashboard/promodo", label: "Pomodoro", Icon: Clock },
    { href: "/dashboard/calendar", label: "Calendar", Icon: Calendar },
  ];

  function isNavActive(
    pathName: string,
    nav: (typeof navItems)[number],
  ): boolean {
    const matchTarget = nav.activeMatch ?? nav.href;
    if (nav.exact) return pathName === matchTarget;
    return pathName === matchTarget || pathName.startsWith(matchTarget + "/");
  }

  return (
    <div className="flex flex-col p-2 bg-linear-180 from-primary to-primary/50 h-screen sticky top-0">
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full items-center justify-center flex">
          <div className="profile bg-white rounded-full flex items-center justify-center overflow-hidden aspect-square w-11 ">
            {user ? (
              user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-gray-600">
                  {user?.name?.charAt(0).toUpperCase() ?? ""}
                </span>
              )
            ) : (
              <span className="text-gray-300">?</span>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Hello</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex flex-col gap-5 p-2 mt-3">
        {navItems.map((nav) => {
          const isActive = isNavActive(pathName, nav);
          return (
            <Link
              href={nav.href}
              key={nav.href}
              className={`${isActive ? "text-primary bg-white" : "text-white"} p-2 rounded-sm`}
            >
              <nav.Icon size={25} />
            </Link>
          );
        })}
      </div>

      <div className="h-full flex flex-col-reverse items-center py-6">
        <NotificationBell apiUrl={apiUrl} />
      </div>
    </div>
  );
};

export default Side;
