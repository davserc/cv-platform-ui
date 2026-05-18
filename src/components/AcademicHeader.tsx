const logos = [
  { src: '/logos/unlu.png', alt: 'Universidad Nacional de Luján', whiteBg: true },
  { src: '/logos/licdia.png', alt: 'LICDIA', whiteBg: false },
  { src: '/logos/cienciasbasicas.png', alt: 'Ciencias Básicas', whiteBg: true },
  { src: '/logos/computacion.png', alt: 'Computación', whiteBg: false },
  { src: '/logos/TacoLogo.png', alt: 'TACO', whiteBg: true },
]

export default function AcademicHeader() {
  return (
    <div className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-5xl mx-auto px-6 py-5 space-y-5">

        {/* Logos */}
        <div className="flex items-center justify-center gap-5 flex-wrap">
          {logos.map(({ src, alt, whiteBg }) => (
            <div
              key={src}
              className={
                whiteBg
                  ? 'bg-white rounded-lg p-2 flex items-center justify-center'
                  : 'flex items-center justify-center'
              }
            >
              <img src={src} alt={alt} className="h-14 w-auto object-contain" />
            </div>
          ))}
        </div>

        {/* Título */}
        <div className="text-center space-y-1">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Diplomatura en Inteligencia Artificial &mdash; Universidad Nacional de Luján
          </p>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Inteligencia Artificial Generativa
          </h1>
          <p className="text-sm text-gray-500">Trabajo Práctico Final</p>
          <p className="text-base font-semibold text-blue-400 tracking-tight">
            Entrenamiento para la detección y clasificación de residuos
          </p>
        </div>

      </div>
    </div>
  )
}
