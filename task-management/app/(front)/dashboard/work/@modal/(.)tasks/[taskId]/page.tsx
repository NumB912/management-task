"use client"
import { Dialog, DialogTitle, DialogContent } from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const Page = () => {
  const route = useRouter()
  return (
    <Dialog open={true} onOpenChange={(open) =>{
      route.back()
    }}>
      <DialogContent>
        <DialogTitle>Hello</DialogTitle>
        Hello
      </DialogContent>
    </Dialog>
  )
}

export default Page