import StatsCard from '../StatsCard'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard title="Completed" value={5} icon={CheckCircle2} color="success" />
      <StatsCard title="Pending" value={3} icon={Clock} color="warning" />
      <StatsCard title="Overdue" value={1} icon={AlertCircle} color="default" />
    </div>
  )
}
