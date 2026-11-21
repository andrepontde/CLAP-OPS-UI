import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { OperatorCreateInput } from './operator.types'

interface OperatorFormProps {
  initialValues: OperatorCreateInput
  submitLabel: string
  isSubmitting: boolean
  error: string
  onSubmit: (values: OperatorCreateInput) => Promise<void>
  cancelTo: string
}

export function OperatorForm({
  initialValues,
  submitLabel,
  isSubmitting,
  error,
  onSubmit,
  cancelTo,
}: OperatorFormProps) {
  const [form, setForm] = useState(initialValues)

  function updateField(
    field: keyof OperatorCreateInput,
    value: string | number | null,
  ) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(form)
  }

  return (
    <form className="vehicle-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h2>Operator details</h2>
        <div className="form-grid">
          <label>
            First name
            <input value={form.name} maxLength={100} onChange={(event) => updateField('name', event.target.value)} required />
          </label>
          <label>
            Last name
            <input value={form.last_name} maxLength={100} onChange={(event) => updateField('last_name', event.target.value)} required />
          </label>
          <label>
            Email
            <input type="email" value={form.email ?? ''} onChange={(event) => updateField('email', event.target.value || null)} />
          </label>
          <label>
            Phone
            <input
              value={form.phone ?? ''}
              maxLength={20}
              pattern="\+?[1-9][0-9]{7,14}"
              title="Phone number must contain 8-15 digits and may start with +"
              placeholder="+353861234567"
              onChange={(event) => updateField('phone', event.target.value || null)}
            />
          </label>
          <label>
            Date of birth
            <input type="date" value={form.date_of_birth ?? ''} onChange={(event) => updateField('date_of_birth', event.target.value || null)} />
          </label>
          <label>
            Employee code
            <input
              value={form.employee_code ?? ''}
              maxLength={6}
              pattern="[A-Za-z]{3}[0-9]{3}"
              title="Employee code must use 3 letters followed by 3 digits"
              placeholder="ABC001"
              onChange={(event) => updateField('employee_code', event.target.value || null)}
            />
          </label>
          <label>
            Labor rate
            <input type="number" min="0" step="0.01" value={form.labor_rate} onChange={(event) => updateField('labor_rate', Number(event.target.value))} required />
          </label>
          <label>
            License class
            <input value={form.license_class ?? ''} maxLength={50} onChange={(event) => updateField('license_class', event.target.value || null)} />
          </label>
          <label>
            License expiration
            <input type="date" value={form.license_expiration_date} onChange={(event) => updateField('license_expiration_date', event.target.value)} required />
          </label>
          <label>
            Address
            <input value={form.address ?? ''} maxLength={255} onChange={(event) => updateField('address', event.target.value || null)} />
          </label>
        </div>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-actions">
        <Link className="secondary-button" to={cancelTo}>Cancel</Link>
        <button className="glass-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
