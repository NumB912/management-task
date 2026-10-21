import React from 'react'
import { Button } from './(front)/components/ui/button'

const NotFound = () => {
  return (
    <div className='flex items-center justify-center h-screen w-full'>
        <div className='flex flex-col'>
            <p className='text-5xl font-mono'>NOT FOUND PAGE</p>
            <div className='content mt-4 max-w-sm'>
            <p className='text-md text-neutral-500'>Không tìm thấy trang vui lòng thử lại, bấm vào nút bên dưới để điều chuyển tới trang chủ</p>
            <Button variant={"default"} className='mt-2 rounded'>Chuyển hướng tới trang chủ</Button>
        </div>
        </div>
    </div>
  )
}

export default NotFound