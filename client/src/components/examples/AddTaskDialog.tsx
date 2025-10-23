import AddTaskDialog from '../AddTaskDialog'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function AddTaskDialogExample() {
  const [open, setOpen] = useState(false)
  const residents = ['Perpetua', 'Eman', 'Allegra', 'Atilla', 'Dania', 'Illy']
  
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Add Task</Button>
      <AddTaskDialog
        open={open}
        onOpenChange={setOpen}
        residents={residents}
        onAdd={(taskName, assignedTo) => {
          console.log('New task:', taskName, 'assigned to:', assignedTo)
        }}
      />
    </div>
  )
}
