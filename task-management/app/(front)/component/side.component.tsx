"use client";
import { Calendar, Circle, Clock, Home, List, LogOut, User, User2 } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "../utils/actor.utils";
import { FileConfig } from "../config/file.config";

const Side = () => {
  const apiUrl = `${process.env.NEXT_PUBLIC_NOTIFICATION_URL}/notifications/stream`;
  const pathName = usePathname();
  const { user } = useUserState();
  const {open,setOpen} = useUserState()
  const logout = useUserState((state)=>state.logout)
  const navItems = [
    { href: "/dashboard", label: "Dashboard", Icon: Home, exact: true },
    {
      href: "/dashboard/work/inbox",
      label: "Work",
      Icon: List,
      activeMatch: "/dashboard/work",
    },
    { href: "/dashboard/pomodoro", label: "Pomodoro", Icon: Clock },
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
        <DropdownMenuTrigger
          className="w-full items-center justify-center flex"
          asChild
        >
          <div className="profile  aspect-square w-11 ">
            <Avatar className="w-11 h-11 ">
              <AvatarImage src={`${FileConfig.FILE_URL}${user?.avatar}`} />
              <AvatarFallback>{getInitials(user?.name ?? "")}</AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-xs min-w-2xs p-0" side="bottom" sideOffset={0}>
          <DropdownMenuItem className="p-3 rounded-none! h-fit border-b border-gray-200" onClick={()=>setOpen(!open)}>
              <div className="flex items-center gap-2">
                              <Avatar className="w-11 h-11 ">
              <AvatarImage src={`${FileConfig.FILE_URL}${user?.avatar}`} />
              <AvatarFallback>{getInitials(user?.name ?? "")}</AvatarFallback>
            </Avatar>
                  <div className=" flex flex-col">
                      <div className="font-bold text-[16px]">{user?.name}</div>
                      <div className="text-sm text-neutral-500">Thông tin người dùng</div>
                  </div>
              </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={()=>{
            logout()
          }} className="p-3 rounded-none">
            <Circle />
            <span>Quên mật khẩu</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={()=>{
            logout()
          }} className="p-3 rounded-none">
            <LogOut />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
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
