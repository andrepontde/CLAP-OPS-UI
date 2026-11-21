import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ApiError } from '../../lib/api'
import { hasFleetRole } from '../../lib/permissions'
import { useAuth } from '../../lib/useAuth'
import { useOperatorApi } from './operator.api'
import { OperatorForm } from './OperatorForm'
import type { OperatorCreateInput } from './operator.types'

const initialForm: OperatorCreateInput = {
  name: '',
  last_name: '',
  email: null,
  phone: null,
  date_of_birth: null,
  address: null,
  employee_code: null,
  labor_rate: 0,
  license_class: null,
  license_expiration_date: '',
}

export function OperatorCreatePage() {
  const { admin, selectedFleetId } = useAuth()
  const navigate = useNavigate()
  const operatorApi = useOperatorApi()
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!hasFleetRole(admin, selectedFleetId, 'MANAGER')) {
    return <Navigate to="/operators" replace />
  }

  async function handleSubmit(values: OperatorCreateInput) {
    setError('')
    setIsSubmitting(true)
    try {
      await operatorApi.create(values)
      navigate('/operators')
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to create operator')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <Link className="back-link" to="/operators">← Operators</Link>
          <p className="eyebrow">Fleet management</p>
          <h1>Add operator</h1>
          <p className="page-description">Add an operator to the currently selected fleet.</p>
        </div>
      </header>
      <OperatorForm initialValues={initialForm} submitLabel="Save operator" isSubmitting={isSubmitting} error={error} onSubmit={handleSubmit} cancelTo="/operators" />
    </section>
  )
}
