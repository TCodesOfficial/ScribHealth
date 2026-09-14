import { useState, useMemo, type FormEvent } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { countries, defaultCountry } from '@/data/countries'

interface SignupFormProps {
  onSubmit: (email: string, password: string, name: string, location?: string) => Promise<void>
}

export default function SignupForm({ onSubmit }: SignupFormProps) {
  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [country, setCountry] = useState(defaultCountry)
  const [state, setState] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const countryOptions = countries.map((c) => ({ value: c.value, label: c.label }))

  const stateOptions = useMemo(() => {
    const selected = countries.find((c) => c.value === country)
    return selected ? selected.states : []
  }, [country])

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value)
    setState('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const selectedCountry = countries.find((c) => c.value === country)
      const selectedState = stateOptions.find((s) => s.value === state)
      const locationParts = [selectedState?.label, selectedCountry?.label].filter(Boolean)
      const location = locationParts.length > 0 ? locationParts.join(', ') : ''
      await onSubmit(email, password, orgName, location)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div id="form-signup">
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-bold font-headline-sm text-slate-900 tracking-tight">
          Create Practitioner Account
        </h2>
        <p className="text-sm text-slate-500 font-body-sm mt-1">
          Register your clinical workstation and department license.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Hospital / Organization Name
          </label>
          <Input
            type="text"
            icon="local_hospital"
            placeholder="e.g. MetroHealth Medical Center"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Work Email
          </label>
          <Input
            type="email"
            icon="mail"
            placeholder="physician@hospital.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Password
          </label>
          <Input
            type="password"
            icon="lock"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Clinical Location
            </label>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline"
            >
              <span className="material-symbols-outlined text-sm">my_location</span>
              Detect Current Location
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select
              options={countryOptions}
              value={country}
              onChange={handleCountryChange}
            />
            <Select
              options={stateOptions}
              placeholder="State / Province"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="voice"
          className="w-full"
          isLoading={isLoading}
          icon="arrow_forward"
        >
          Create Practitioner Account
        </Button>
      </form>
    </div>
  )
}
