import TaskTable from '../TaskTable'
import { useState } from 'react'

export default function TaskTableExample() {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      name: 'Take Out Trash & Replace Bag',
      assignedTo: 'Perpetua',
      status: 'completed' as const,
      completedAt: '2024-01-15 14:30',
      proofCount: 2
    },
    {
      id: '2',
      name: 'Sweep/Vacuum & Mop Floors',
      assignedTo: 'Atilla',
      status: 'pending' as const,
      proofCount: 0
    },
    {
      id: '3',
      name: 'Dust & Wipe Surfaces',
      assignedTo: 'Illy',
      status: 'overdue' as const,
      proofCount: 0
    }
  ])
  
  return (
    <TaskTable
      tasks={tasks}
      onComplete={(taskId, images) => {
        console.log('Complete task:', taskId, 'with images:', images)
        setTasks(tasks.map(t => 
          t.id === taskId 
            ? { ...t, status: 'completed' as const, completedAt: new Date().toLocaleString(), proofCount: images.length }
            : t
        ))
      }}
      onDelete={(taskId) => {
        console.log('Delete task:', taskId)
        setTasks(tasks.filter(t => t.id !== taskId))
      }}
    />
  )
}
