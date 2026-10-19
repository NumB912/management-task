import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import React from 'react'
import { useHeader } from '../providers/header.provider'
const NavComponent = () => {

  const {title} = useHeader()

  return (
       <header className="flex gap-2 items-center pt-5 w-full ml-3">
          <SidebarTrigger className={cn(`hover:bg-primary/10`)} size={"lg"} />
          <div className="title w-full">
            <p className="text-xl font-bold">{title}</p>
          </div>
        </header>
  )
}

export default NavComponent