import { Button } from "@/app/(front)/components/ui/button"
import { cn } from "@/lib/utils"

const DayPicker31 = ({ selected, onSelect }: { 
  selected: number[]
  onSelect: (days: number[]) => void 
}) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1)  

  const toggle = (day: number) => {
    if (selected.includes(day)) {
      onSelect(selected.filter(d => d !== day))  
    } else {
      onSelect([...selected, day])              
    }
  }


  return (
    <div className="grid grid-cols-7 gap-1 border-t border-gray-200 pt-5">
      {days.map(day => (
        <Button
          key={day}
          onClick={() => toggle(day)}
          className={cn(
            "h-9 w-9 rounded-full text-sm cursor-pointer bg-white text-gray-600",
            selected.includes(day)
              ? "bg-primary text-white"
              : "hover:bg-gray-200"
          )}
        >
          {day}
        </Button>
      ))}
    </div>
  )
}
export default DayPicker31