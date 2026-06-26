import { Routes, Route } from 'react-router'
import Dashboard from './pages/Dashboard'
import Analysis from './pages/Analysis'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/analysis" element={<Analysis />} />
    </Routes>
  )
}
