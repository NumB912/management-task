import { Dialog, DialogContent } from '@/components/ui/dialog'
import React from 'react'
import { IPromodoroModel } from '../../model/promodo.model'

const PromodoModalSession = ({
progress
}:{progress:IPromodoroModel["progress"]}) => {

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

export default PromodoModalSession