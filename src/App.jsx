import { useState, useEffect } from 'react'
import keycloak from './keycloak'

const API_BASE = 'http://ostara-rso.031268394.xyz/api'
const QR_GENERATOR_URL = 'http://ostara-rso.031268394.xyz/generate_pdf'

export default function App() {
  const [activeTab, setActiveTab] = useState('persons')

const renderContent = () => {
  switch (activeTab) {
    case 'persons':
      return <PersonsTab />
    case 'kiosks':
      return <KiosksTab />
    case 'printouts':
      return <div>Printouts (TODO)</div>
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






function KiosksTab() {
  const [kiosks, setKiosks] = useState([])
  const [form, setForm] = useState({ name: '', location: '', auth: '' })

  const loadKiosks = async () => {
    const res = await fetch(`${API_BASE}/clients`)
    setKiosks(await res.json())
  }

  useEffect(() => {
    loadKiosks()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setForm({ name: '', location: '', auth: '' })
    loadKiosks()
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Kiosks</h2>

      {/* Add form */}
      <form onSubmit={submit} className="flex gap-2 mb-6">
        <input
          className="border p-2 rounded w-1/4"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border p-2 rounded w-1/4"
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <input
          className="border p-2 rounded w-1/4"
          placeholder="Auth key"
          value={form.auth}
          onChange={(e) => setForm({ ...form, auth: e.target.value })}
        />
        <button className="bg-blue-600 text-white px-4 rounded">
          Add
        </button>
      </form>

      {/* Table */}
      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Location</th>
            <th className="p-2 text-left">Auth</th>
          </tr>
        </thead>
        <tbody>
          {kiosks.map((k) => (
            <tr key={k.id} className="border-t">
              <td className="p-2">{k.id}</td>
              <td className="p-2">{k.name}</td>
              <td className="p-2">{k.location}</td>
              <td className="p-2 font-mono text-sm">{k.auth}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}



function PersonsTab() {
  const [persons, setPersons] = useState([])
  const [depts, setDepts] = useState([])
  const [selected, setSelected] = useState([])
  const [action, setAction] = useState('generate_qr')
  const [form, setForm] = useState({ name: '', deptId: '' })

  const loadAll = async () => {
    const [p, d] = await Promise.all([
      fetch(`${API_BASE}/persons`).then(r => r.json()),
      fetch(`${API_BASE}/depts`).then(r => r.json()),
    ])
    setPersons(p)
    setDepts(d)
  }

  useEffect(() => { loadAll() }, [])

  // Add person
  const submit = async (e) => {
    e.preventDefault()
    await fetch(`${API_BASE}/persons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        dept: { deptId: Number(form.deptId) },
      }),
    })
    setForm({ name: '', deptId: '' })
    loadAll()
  }

  // Checkbox logic
  const toggle = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selected.length === persons.length) {
      setSelected([])
    } else {
      setSelected(persons.map(p => p.personId))
    }
  }

  // Bulk RUN
  const runAction = async () => {
    if (!selected.length) return alert('Select at least one person')

    if (action === 'generate_qr') {
      const csvRes = await fetch(`${API_BASE}/persons/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selected),
      })
      const csvText = await csvRes.text()

      const blob = new Blob([csvText], { type: 'text/csv' })
      const formData = new FormData()
      formData.append('file', blob, 'persons.csv')

      const pdfRes = await fetch(
        '${QR_GENERATOR_URL}',
        { method: 'POST', body: formData }
      )

      const pdfBlob = await pdfRes.blob()

      const url = window.URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'qr-codes.pdf'
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Persons</h2>

      {/* Bulk actions */}
      <div className="flex items-center gap-3 mb-4">
        <select
          className="border p-2 rounded"
          value={action}
          onChange={(e) => setAction(e.target.value)}
        >
          <option value="generate_qr">Generate QR codes</option>
        </select>

        <button
          onClick={runAction}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          RUN
        </button>

        <span className="text-sm text-gray-600">
          {selected.length} selected
        </span>
      </div>

      {/* Add person form */}
      <form onSubmit={submit} className="flex gap-2 mb-6">
        <input
          className="border p-2 rounded w-1/3"
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <select
          className="border p-2 rounded w-1/3"
          value={form.deptId}
          onChange={(e) => setForm({ ...form, deptId: e.target.value })}
        >
          <option value="">Select department</option>
          {depts.map((d) => (
            <option key={d.deptId} value={d.deptId}>{d.name}</option>
          ))}
        </select>

        <button className="bg-blue-600 text-white px-4 rounded">
          Add
        </button>
      </form>

      {/* Persons table */}
      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">
              <input
                type="checkbox"
                checked={selected.length === persons.length && persons.length > 0}
                onChange={toggleAll}
              />
            </th>
            <th className="p-2 text-left">ID</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Department</th>
          </tr>
        </thead>
        <tbody>
          {persons.map((p) => (
            <tr key={p.personId} className="border-t">
              <td className="p-2">
                <input
                  type="checkbox"
                  checked={selected.includes(p.personId)}
                  onChange={() => toggle(p.personId)}
                />
              </td>
              <td className="p-2">{p.personId}</td>
              <td className="p-2">{p.name}</td>
              <td className="p-2">{p.dept.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
