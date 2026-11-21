import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PermissionGate } from '../../components/PermissionGate'
import { ApiError } from '../../lib/api'
import { hasFleetRole } from '../../lib/permissions'
import { useAuth } from '../../lib/useAuth'
import { useOperatorApi } from './operator.api'
import type { Operator, OperatorUpdateInput } from './operator.types'

const detailTabs = [
  { label: 'Overview', available: true },
  { label: 'Assignments', available: false },
  { label: 'Work history', available: false },
  { label: 'Documents', available: false },
]

function formatDate(value: string | null) {
  if (!value) return 'Not provided'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })
    .format(new Date(`${value}T00:00:00`))
}

export function OperatorDetailPage() {
  const { admin, selectedFleetId } = useAuth()
  const { operatorId } = useParams<{ operatorId: string }>()
  const navigate = useNavigate()
  const operatorApi = useOperatorApi()
  const [operator, setOperator] = useState<Operator | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingField, setEditingField] = useState<keyof OperatorUpdateInput | null>(null)
  const canManage = hasFleetRole(admin, selectedFleetId, 'MANAGER')

  useEffect(() => {
    if (!operatorId) return
    let isMounted = true
    operatorApi.get(operatorId)
      .then((response) => { if (isMounted) setOperator(response) })
      .catch((requestError) => {
        if (isMounted) setError(requestError instanceof ApiError ? requestError.message : 'Unable to load operator')
      })
      .finally(() => { if (isMounted) setIsLoading(false) })
    return () => { isMounted = false }
  }, [operatorApi, operatorId])

  async function handleDelete() {
    if (!operator || !window.confirm(`Delete ${operator.name} ${operator.last_name}?`)) return
    setError('')
    setIsDeleting(true)
    try {
      await operatorApi.delete(operator.id)
      navigate('/operators', { replace: true })
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to delete operator')
    } finally {
      setIsDeleting(false)
    }
  }

  async function saveField(field: keyof OperatorUpdateInput, value: string | number | null) {
    if (!operator) return
    setError('')
    setIsSaving(true)
    try {
      const updatedOperator = await operatorApi.update(operator.id, { [field]: value })
      setOperator(updatedOperator)
      setEditingField(null)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to update operator')
    } finally {
      setIsSaving(false)
    }
  }

  if (!operatorId) {
    return <section><Link className="back-link" to="/operators">← Operators</Link><div className="empty-state">Operator ID is missing</div></section>
  }
  if (isLoading) return <p>Loading operator...</p>
  if (error || !operator) {
    return <section><Link className="back-link" to="/operators">← Operators</Link><div className="empty-state" role="alert">{error || 'Operator not found'}</div></section>
  }

  return (
    <section>
      <header className="detail-header">
        <div>
          <Link className="back-link" to="/operators">← Operators</Link>
          <p className="eyebrow">Operator details</p>
          <h1>{operator.name} {operator.last_name}</h1>
          <p className="page-description">{operator.employee_code ? `Employee ${operator.employee_code}` : 'Fleet operator'}</p>
        </div>
        <div className="detail-header-actions">
          <PermissionGate allowed={canManage}>
            <Link className="secondary-button" to={`/operators/${operator.id}/edit`}>
              Edit
            </Link>
            <button className="danger-button" type="button" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </PermissionGate>
        </div>
      </header>

      <nav className="detail-tabs" aria-label="Operator sections">
        {detailTabs.map((tab) => (
          <span
            className={`detail-tab ${tab.available ? 'active' : 'disabled'}`}
            key={tab.label}
            aria-disabled={!tab.available}
          >
            {tab.label}
          </span>
        ))}
      </nav>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="detail-grid operator-detail-grid">
        <section className="detail-card">
          <h2>Operator information</h2>
          <dl className="detail-list">
            <EditableDetailItem label="First name" field="name" value={operator.name} editingField={editingField} isSaving={isSaving} canEdit={canManage} onEdit={setEditingField} onSave={saveField} required />
            <EditableDetailItem label="Last name" field="last_name" value={operator.last_name} editingField={editingField} isSaving={isSaving} canEdit={canManage} onEdit={setEditingField} onSave={saveField} required />
            <EditableDetailItem label="Email" field="email" value={operator.email} inputType="email" editingField={editingField} isSaving={isSaving} canEdit={canManage} onEdit={setEditingField} onSave={saveField} />
            <EditableDetailItem label="Phone" field="phone" value={operator.phone} inputType="tel" inputPattern="[+]?[1-9][0-9]{7,14}" inputTitle="Phone number must contain 8-15 digits and may start with +" editingField={editingField} isSaving={isSaving} canEdit={canManage} onEdit={setEditingField} onSave={saveField} />
            <EditableDetailItem label="Date of birth" field="date_of_birth" value={operator.date_of_birth} displayValue={formatDate(operator.date_of_birth)} inputType="date" editingField={editingField} isSaving={isSaving} canEdit={canManage} onEdit={setEditingField} onSave={saveField} />
            <EditableDetailItem label="Address" field="address" value={operator.address} editingField={editingField} isSaving={isSaving} canEdit={canManage} onEdit={setEditingField} onSave={saveField} />
            <EditableDetailItem label="Employee code" field="employee_code" value={operator.employee_code} inputPattern="[A-Za-z]{3}[0-9]{3}" inputTitle="Employee code must use 3 letters followed by 3 digits" editingField={editingField} isSaving={isSaving} canEdit={canManage} onEdit={setEditingField} onSave={saveField} />
            <EditableDetailItem label="Labor rate" field="labor_rate" value={operator.labor_rate} displayValue={Number(operator.labor_rate).toLocaleString(undefined, { style: 'currency', currency: 'MXN' })} inputType="number" editingField={editingField} isSaving={isSaving} canEdit={canManage} onEdit={setEditingField} onSave={saveField} required />
            <EditableDetailItem label="License class" field="license_class" value={operator.license_class} editingField={editingField} isSaving={isSaving} canEdit={canManage} onEdit={setEditingField} onSave={saveField} />
            <EditableDetailItem label="License expiration" field="license_expiration_date" value={operator.license_expiration_date} displayValue={formatDate(operator.license_expiration_date)} inputType="date" editingField={editingField} isSaving={isSaving} canEdit={canManage} onEdit={setEditingField} onSave={saveField} required />
          </dl>
        </section>
      </div>
    </section>
  )
}

interface EditableDetailItemProps {
  label: string
  field: keyof OperatorUpdateInput
  value: string | number | null
  displayValue?: string
  inputType?: 'text' | 'email' | 'tel' | 'number' | 'date'
  inputPattern?: string
  inputTitle?: string
  required?: boolean
  canEdit: boolean
  editingField: keyof OperatorUpdateInput | null
  isSaving: boolean
  onEdit: (field: keyof OperatorUpdateInput | null) => void
  onSave: (field: keyof OperatorUpdateInput, value: string | number | null) => Promise<void>
}

function EditableDetailItem({
  label,
  field,
  value,
  displayValue,
  inputType = 'text',
  inputPattern,
  inputTitle,
  required = false,
  canEdit,
  editingField,
  isSaving,
  onEdit,
  onSave,
}: EditableDetailItemProps) {
  const isEditingThisField = editingField === field
  const inputValue = value ?? ''

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const rawValue = formData.get('value')?.toString() ?? ''
    if (required && rawValue === '') return
    const nextValue = inputType === 'number'
      ? Number(rawValue)
      : rawValue || null
    await onSave(field, nextValue)
  }

  return (
    <div className="detail-item">
      <dt>{label}</dt>
      <dd>
        {isEditingThisField ? (
          <form className="inline-edit" onSubmit={handleSave}>
            <input
              autoFocus
              defaultValue={String(inputValue)}
              name="value"
              type={inputType}
              pattern={inputPattern}
              title={inputTitle}
              required={required}
            />
            <button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
            <button type="button" className="inline-cancel" onClick={() => onEdit(null)} disabled={isSaving}>Cancel</button>
          </form>
        ) : (
          canEdit ? (
            <button className="detail-value-button" type="button" onClick={() => onEdit(field)}>
              {displayValue ?? (value === null ? 'Not provided' : String(value))}
            </button>
          ) : (
            <span>{displayValue ?? (value === null ? 'Not provided' : String(value))}</span>
          )
        )}
      </dd>
    </div>
  )
}
