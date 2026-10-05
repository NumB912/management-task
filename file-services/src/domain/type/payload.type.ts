export type RegisterUserPayload = {
  email:string,
  password:string,
  firstName:string,
  lastName:string
}

export type CreateUserPayload = {
  firstName:string,
  lastName:string,
  auth_id:string
}

export type TransactionRegister = {
  auth_id:string,
}

export type SendOtpPayload = {
  otp:string,
  email:string
}

