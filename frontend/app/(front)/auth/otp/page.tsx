import React, { Suspense } from 'react'
import OtpForm from '../../components/auth/otpForm'

const page = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
        <OtpForm/>
    </Suspense>
  )
}

export default page