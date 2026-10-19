import React, { Suspense } from 'react'
import OtpForm from '../../components/auth/otpForm'
import RegisterForm from '../../components/auth/registerForm'

const page = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
        <RegisterForm/>
    </Suspense>
  )
}

export default page