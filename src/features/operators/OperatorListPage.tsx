import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PermissionGate } from '../../components/PermissionGate'
import { ApiError } from '../../lib/api'
import { hasFleetRole } from '../../lib/permissions'
import { useAuth } from '../../lib/useAuth'
import { useOperatorApi } from './operator.api'
import type { Operator } from './operator.types'

function formatDate(value: string | null) {
  if (!value) return 'Not provided'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })
    .format(new Date(`${value}T00:00:00`))
}

export function OperatorListPage() {
  const { admin, selectedFleetId } = useAuth()
  const operatorApi = useOperatorApi()
  const canManage = hasFleetRole(admin, selectedFleetId, 'MANAGER')
  const [operators, setOperators] = useState<Operator[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!selectedFleetId) return
    let isMounted = true
    operatorApi.list()
      .then((response) => {
        if (isMounted) setOperators(response.operators)
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(requestError instanceof ApiError ? requestError.message : 'Unable to load operators')
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => { isMounted = false }
  }, [selectedFleetId, operatorApi])

  if (!selectedFleetId) {
    return (
      <section>
        <header className="page-header">
          <div><p className="eyebrow">Fleet management</p><h1>Operators</h1></div>
        </header>
        <div className="empty-state">You do not have access to a fleet yet.</div>
      </section>
    )
  }

  return (
    <section>
      <header className="page-header">
        <div>
          <p className="eyebrow">Fleet management</p>
          <h1>Operators</h1>
          <p className="page-description">Manage the operators assigned to your selected fleet.</p>
        </div>
        <PermissionGate allowed={canManage}>
          <Link className="glass-button" to="/operators/new"><span aria-hidden="true">+</span>Add operator</Link>
        </PermissionGate>
      </header>

      {isLoading && <p>Loading operators...</p>}
      {error && <p className="form-error" role="alert">{error}</p>}
      {!isLoading && !error && operators.length === 0 && (
        <div className="empty-state">No operators have been added yet.</div>
      )}
      {operators.length > 0 && (
        <div className="table-shell">
          <table>
            <thead><tr><th>Name</th><th>Employee code</th><th>License</th><th>License expiration</th><th>Labor rate</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {operators.map((operator) => (
                <tr key={operator.id}>
                  <td>{operator.name} {operator.last_name}</td>
                  <td>{operator.employee_code ?? 'Not provided'}</td>
                  <td>{operator.license_class ?? 'Not provided'}</td>
                  <td>{formatDate(operator.license_expiration_date)}</td>
                  <td>{Number(operator.labor_rate).toLocaleString(undefined, { style: 'currency', currency: 'MXN' })}</td>
                  <td>
                    <Link className="table-action" to={`/operators/${operator.id}`}>View details</Link>
                    <PermissionGate allowed={canManage}>
                      <Link className="table-action table-action-secondary" to={`/operators/${operator.id}/edit`}>Edit</Link>
                    </PermissionGate>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
