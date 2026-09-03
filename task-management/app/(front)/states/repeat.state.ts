import {create} from 'zustand'
import { IRepeat } from '../model/rule/rule.model'

interface RepeatStoreProp{
    mode:"none"|"sepecifiday"|"week"|"day"|"month",
    every:number,
    dates:number[],
    days:number[],
    specificDays:Date[],
    clear:()=>void
    confirm:()=>Partial<IRepeat>
}


const useRepeat = create<RepeatStoreProp>((set,get)=>({
    mode:"none",
    dates:[],
    days:[],
    specificDays:[],
    every:1,
    clear(){
        set({dates:[],days:[],every:0,specificDays:[],mode:"none"})
    },

    confirm(){
        const {mode,dates,days,every,specificDays} = get()
        let data = {}
        switch(mode){
            case 'day':
                data = {
                    every:every
                }
                break
            case 'month':
                data = {
                    dates:dates,
                    every:every
                }
            case 'week':
                data = {
                    days:days,
                    every:every
                }
                break
            case 'sepecifiday':
                data = {
                    specificDays:specificDays
                }
                break
            default:
                data = {}
                break
        }

        return {
            ...data,
            mode:mode
        } as IRepeat
    }

}))

export default useRepeat