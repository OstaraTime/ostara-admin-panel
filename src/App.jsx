import { useState } from 'react'
import keycloak from './keycloak'

export default function App() {
  const [activeTab, setActiveTab] = useState('persons')

  const renderContent = () => {
    switch (activeTab) {
      case 'persons':
        return <div>Person Management</div>
      case 'kiosks':
        return <div>Kiosk Management</div>
      case 'printouts':
        return <div>Printouts</div>
      default:
        return null
    }
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
        <h1 className="text-xl font-bold mb-6">Management</h1>

        <button
          className="text-left px-3 py-2 rounded hover:bg-gray-700"
          onClick={() => setActiveTab('persons')}
        >
          Persons
        </button>

        <button
          className="text-left px-3 py-2 rounded hover:bg-gray-700"
          onClick={() => setActiveTab('kiosks')}
        >
          Kiosks
        </button>

        <button
          className="text-left px-3 py-2 rounded hover:bg-gray-700"
          onClick={() => setActiveTab('printouts')}
        >
          Printouts
        </button>

        <div className="mt-auto pt-4 border-t border-gray-700">
          <div className="text-sm mb-2">
            {keycloak.tokenParsed?.preferred_username}
          </div>

          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
            onClick={() => keycloak.logout()}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-100">
        {renderContent()}
      </main>
    </div>
  )
}
