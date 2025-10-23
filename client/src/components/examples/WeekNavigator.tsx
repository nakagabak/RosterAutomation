import WeekNavigator from '../WeekNavigator'
import { useState } from 'react'

export default function WeekNavigatorExample() {
  const [date, setDate] = useState(new Date())
  
  return (
    <WeekNavigator 
      currentDate={date} 
      onNavigate={setDate}
      onToday={() => setDate(new Date())}
    />
  )
}
