import { redirect } from 'next/navigation'
import React from 'react'

const page = () => {
  redirect("/dashboard/work/inbox")
}

export default page