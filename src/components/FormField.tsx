import InfoPopover from './InfoPopover'

interface Props {
  label: string
  description?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export default function FormField({ label, description, required, className = '', children }: Props) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-sm text-gray-400">
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </span>
        {description && <InfoPopover description={description} />}
      </div>
      {children}
    </div>
  )
}
