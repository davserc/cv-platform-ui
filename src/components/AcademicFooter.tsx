export default function AcademicFooter() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/50 mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">

        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="uppercase tracking-wider">Alumno</span>
          <span className="text-gray-700">·</span>
          <span className="text-gray-400 font-medium">David Serrano</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <span className="uppercase tracking-wider">Profesores</span>
          <span className="text-gray-700">·</span>
          <span className="text-gray-400">Juan Manuel Fernández</span>
          <span className="text-gray-700">&amp;</span>
          <span className="text-gray-400">David Petrocelli</span>
        </div>

      </div>
    </footer>
  )
}
