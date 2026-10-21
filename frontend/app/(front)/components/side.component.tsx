"use client";
import {  Calendar, Circle, Clock, Home, List, LogOut, ShieldCheck,Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useUserState from "../feature/store/user/user.state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import NotificationBell from "./notifier/notificationBell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "../utils/actor.utils";
import { resolveSrc } from "../utils/readURL.utils";
import NotificationStream from "../feature/hook/notification/notificationStream.hook";
import MobileNavigation from "./mobile-navigation";
import { useIsMobile } from "@/hooks/use-mobile";

const Side = () => {
  const isMobile = useIsMobile();
   const pathName = usePathname();
  const { user } = useUserState();
  const {open,setOpen} = useUserState()
  const logout = useUserState((state)=>state.logout)
  const imageSrc = resolveSrc(user?.avatar)
  const navItems = [
    {
      href: "/dashboard/work/inbox",
      label: "Work",
      Icon: List,
      activeMatch: "/dashboard/work",
    },
    { href: "/dashboard/pomodoro", label: "Pomodoro", Icon: Clock },
    { href: "/dashboard/calendar", label: "Calendar", Icon: Calendar },
    { href: "/dashboard/report", label: "Report", Icon:Activity,exact:true },
  
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Quản trị", Icon: ShieldCheck }] : []),
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
    <>
      {isMobile && (
        <MobileNavigation
          items={navItems.map((nav) => ({
            href: nav.href,
            label: nav.exact ? "Home" : nav.label,
            Icon: nav.Icon,
            active: isNavActive(pathName, nav),
          }))}
          avatarSrc={imageSrc}
          userName={user?.name ?? "Tài khoản"}
          onProfile={() => setOpen(true)}
          onLogout={logout}
        />
      )}
      <div className="sticky top-0 hidden h-dvh shrink-0 flex-col items-center bg-linear-180 from-primary to-primary/50 p-2 md:flex">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="ml-auto flex items-center justify-center md:ml-0 md:w-full"
          asChild
        >
          <button type="button" aria-label="Mở menu tài khoản" className="profile aspect-square w-11 rounded-full">
            <Avatar className="w-11 h-11 ">
              <AvatarImage src={imageSrc} />
              <AvatarFallback>{getInitials(user?.name ?? "")}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-w-xs min-w-2xs p-0" side="bottom" sideOffset={0}>
          <DropdownMenuItem className="p-3 rounded-none! h-fit border-b border-gray-200" onClick={()=>setOpen(!open)}>
              <div className="flex items-center gap-2">
                              <Avatar className="w-11 h-11 ">
              <AvatarImage src={imageSrc} />
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

      <nav aria-label="Điều hướng chính" className="mt-3 hidden flex-col gap-5 p-2 md:flex">
        {navItems.map((nav) => {
          const isActive = isNavActive(pathName, nav);
          return (
            <Link
              href={nav.href}
              aria-label={nav.label}
              title={nav.label}
              aria-current={isActive ? "page" : undefined}
              key={nav.href}
              className={`${isActive ? "text-primary bg-white" : "text-white"} p-2 rounded-sm`}
            >
              <nav.Icon size={25} />
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center md:mt-auto md:flex-col-reverse md:py-6">
        <NotificationBell/>
      </div>
    </div>
    <NotificationStream />
    </>
  );
};

export default Side;
