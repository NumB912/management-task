export enum RepeatModePresent {
  None = "none",
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Custom = "custom",
}
 
export enum RepeatType {
  SpecificDay="specific",
  Repeat="repeat"
}

export enum Unit{
  Day="day",
  Month="month",
  Week="week",
  None="none"
}

type dayOfWeek = Record<number,String>
type SettingCustom = Record<RepeatModePresent,string>


export const dayOfWeek:dayOfWeek = {
  0:"CN",
  1:"Thứ Hai",
  2:"Thứ Ba",
  3:"Thứ Tư",
  4:"Thứ Năm",
  5:"Thứ Sáu",
  6:"Thứ Bảy"
} as const


export const SettingCustom:SettingCustom = {
  custom:"Tùy chỉnh",
  daily:"Hàng ngày",
  monthly:"Hàng tháng",
  none:"",
  weekly:"Hàng tuần"
}