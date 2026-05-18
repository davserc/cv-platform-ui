import { Routes, Route, NavLink } from 'react-router-dom'
import { ApiKeyProvider, useApiKey } from './context/ApiKeyContext'
import TrainingPage from './pages/TrainingPage'
import ModelsPage from './pages/ModelsPage'
import InferencePage from './pages/InferencePage'
import ConfigPage from './pages/ConfigPage'
import RequireApiKey from './components/RequireApiKey'
import AcademicHeader from './components/AcademicHeader'
import AcademicFooter from './components/AcademicFooter'

function AppShell() {
  const { apiKey } = useApiKey()

  const navLinks = [
    { to: '/', label: 'Training', end: true },
    { to: '/models', label: 'Models', end: false },
    { to: '/infer', label: 'Inference', end: false },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <AcademicHeader />
      <header className="border-b border-gray-800 px-6 py-3 flex items-center gap-8">
        <span className="font-semibold text-white tracking-tight">CV Platform</span>
        <nav className="flex gap-6 text-sm items-center">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? 'text-blue-400 font-medium' : 'text-gray-400 hover:text-gray-200'
              }
            >
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/config"
            className={({ isActive }) =>
              isActive ? 'text-blue-400 font-medium flex items-center gap-1.5' : 'text-gray-400 hover:text-gray-200 flex items-center gap-1.5'
            }
          >
            Config
            {!apiKey && (
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" title="API Key no configurada" />
            )}
          </NavLink>
        </nav>
      </header>
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <Routes>
          <Route path="/" element={<RequireApiKey><TrainingPage /></RequireApiKey>} />
          <Route path="/models" element={<RequireApiKey><ModelsPage /></RequireApiKey>} />
          <Route path="/infer" element={<RequireApiKey><InferencePage /></RequireApiKey>} />
          <Route path="/config" element={<ConfigPage />} />
        </Routes>
      </main>
      <AcademicFooter />
    </div>
  )
}

export default function App() {
  return (
    <ApiKeyProvider>
      <AppShell />
    </ApiKeyProvider>
  )
}
