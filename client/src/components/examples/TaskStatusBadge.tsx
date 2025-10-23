import TaskStatusBadge from '../TaskStatusBadge'

export default function TaskStatusBadgeExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <TaskStatusBadge status="completed" />
      <TaskStatusBadge status="pending" />
      <TaskStatusBadge status="overdue" />
    </div>
  )
}
