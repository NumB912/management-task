import { Dialog, DialogContent } from '@/components/ui/dialog'
import React from 'react'
import { IPomodoroModel } from '../../model/pomodoro.model'

const pomodoroModalSession = ({
progress
}:{progress:IPomodoroModel["progress"]}) => {

  if(!progress || progress?.length==0){
    return
  }

  return (
    <Dialog open={progress.length>0}>

        <DialogContent>
                hello
        </DialogContent>

    </Dialog>
  )
}

export default pomodoroModalSession