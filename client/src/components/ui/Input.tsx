import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative">
          {icon && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <span className="material-symbols-outlined text-lg">{icon}</span>
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-slate-50
              border border-slate-300
              rounded-lg font-body-md text-body-md
              text-slate-900
              placeholder:text-slate-400
              focus:bg-white
              focus:border-teal-500
              focus:ring-2 focus:ring-teal-500/20
              transition duration-150 outline-none
              ${icon ? 'pl-10' : 'pl-4'}
              pr-4 py-2.5
              ${error ? 'border-red-500 focus:ring-red-500/20' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-500 text-body-sm mt-1">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export default Input
