import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ApiError } from '../../lib/api'
import { hasFleetRole } from '../../lib/permissions'
import { useAuth } from '../../lib/useAuth'
import { useOperatorApi } from './operator.api'
import { OperatorForm } from './OperatorForm'
import type { Operator, OperatorCreateInput } from './operator.types'

function toFormValues(operator: Operator): OperatorCreateInput {
  return {
    name: operator.name,
    last_name: operator.last_name,
    email: operator.email,
    phone: operator.phone,
    date_of_birth: operator.date_of_birth,
    address: operator.address,
    employee_code: operator.employee_code,
    labor_rate: Number(operator.labor_rate),
    license_class: operator.license_class,
    license_expiration_date: operator.license_expiration_date,
  }
}

export function OperatorEditPage() {
  const { admin, selectedFleetId } = useAuth()
  const { operatorId } = useParams<{ operatorId: string }>()
  const navigate = useNavigate()
  const operatorApi = useOperatorApi()
  const [operator, setOperator] = useState<Operator | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  if (!hasFleetRole(admin, selectedFleetId, 'MANAGER')) {
    return <Navigate to="/operators" replace />
  }
  if (!operatorId || isLoading) return <p>Loading operator...</p>
  if (!operator) {
    return <section><Link className="back-link" to="/operators">← Operators</Link><div className="empty-state" role="alert">{error || 'Operator not found'}</div></section>
  }

  async function handleSubmit(values: OperatorCreateInput) {
    setError('')
    setIsSubmitting(true)
    try {
      await operatorApi.update(operator!.id, values)
      navigate(`/operators/${operator!.id}`)
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : 'Unable to update operator')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <Link className="back-link" to={`/operators/${operator.id}`}>← Operator details</Link>
          <p className="eyebrow">Fleet management</p>
          <h1>Edit {operator.name} {operator.last_name}</h1>
        </div>
      </header>
      <OperatorForm initialValues={toFormValues(operator)} submitLabel="Save changes" isSubmitting={isSubmitting} error={error} onSubmit={handleSubmit} cancelTo={`/operators/${operator.id}`} />
    </section>
  )
}
