import TaskCompletionDialog from '../TaskCompletionDialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TaskCompletionDialogExample() {
  const [open, setOpen] = useState(false)
  
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Completion Dialog</Button>
      <TaskCompletionDialog
        open={open}
        onOpenChange={setOpen}
        taskName="Take Out Trash & Replace Bag"
        assignedTo="Perpetua"
        onComplete={(images) => {
          console.log('Task completed with images:', images)
        }}
      />
    </div>
  )
}
