import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  placeholder?: string
}

export default function Select({ options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <select
      className={`
        w-full px-3 py-2.5
        bg-slate-50
        border border-slate-300
        rounded-lg font-body-md text-body-md
        text-slate-900
        focus:bg-white
        focus:border-teal-500
        focus:ring-2 focus:ring-teal-500/20
        transition duration-150 outline-none
        ${className}
      `}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
