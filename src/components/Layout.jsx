import { useState } from 'react'
import PersonManagement from './PersonManagement'
import KioskManagement from './KioskManagement'
import Printouts from './Printouts'

export default function Layout() {
  const [active, setActive] = useState('persons')

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <button onClick={() => setActive('persons')} className="p-4 hover:bg-gray-700">Person Management</button>
        <button onClick={() => setActive('kiosks')} className="p-4 hover:bg-gray-700">Kiosk Management</button>
        <button onClick={() => setActive('printouts')} className="p-4 hover:bg-gray-700">Printouts</button>
      </aside>
      <main className="flex-1 p-6">
        {active === 'persons' && <PersonManagement />}
        {active === 'kiosks' && <KioskManagement />}
        {active === 'printouts' && <Printouts />}
      </main>
    </div>
  )
}
