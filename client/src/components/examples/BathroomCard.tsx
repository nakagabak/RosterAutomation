import BathroomCard from '../BathroomCard'
import { useState } from 'react'

export default function BathroomCardExample() {
  const [bathroom, setBathroom] = useState({
    assignedTo: 'Eman',
    cleaningMode: 'deep' as 'basic' | 'deep'
  })
  const residents = ['Perpetua', 'Eman', 'Allegra', 'Atilla', 'Dania', 'Illy']
  
  return (
    <div className="max-w-sm">
      <BathroomCard
        bathroomNumber={1}
        assignedTo={bathroom.assignedTo}
        cleaningMode={bathroom.cleaningMode}
        residents={residents}
        onUpdate={(assignedTo, cleaningMode) => {
          console.log('Updated:', assignedTo, cleaningMode)
          setBathroom({ assignedTo, cleaningMode })
        }}
      />
    </div>
  )
}
