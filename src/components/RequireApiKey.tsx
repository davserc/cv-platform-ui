import { Link } from 'react-router-dom'
import { useApiKey } from '../context/ApiKeyContext'

export default function RequireApiKey({ children }: { children: React.ReactNode }) {
  const { apiKey } = useApiKey()

  if (apiKey) return <>{children}</>

  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <div className="w-10 h-10 rounded-full bg-yellow-900/40 border border-yellow-700/50 flex items-center justify-center text-yellow-400 text-lg font-bold">
        !
      </div>
      <p className="text-gray-300 text-sm">
        Necesitás configurar el <span className="font-mono text-yellow-300">API Key</span> antes de
        poder usar los servicios de backend.
      </p>
      <Link
        to="/config"
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
      >
        Ir a Configuracion
      </Link>
    </div>
  )
}
