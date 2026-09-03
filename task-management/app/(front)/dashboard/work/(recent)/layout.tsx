import React from 'react'

export default function InboxLayout({ children, modal }:Readonly<{children:React.ReactNode,modal:React.ReactNode}>) {
  return (
    <>
     {children}
      {modal}
    </>
  )
}