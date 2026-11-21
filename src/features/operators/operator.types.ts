export interface Operator {
  id: string
  fleet_id: string
  name: string
  last_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  address: string | null
  employee_code: string | null
  labor_rate: number | string
  license_class: string | null
  license_expiration_date: string
  created_at: string
}

export interface OperatorListResponse {
  operators: Operator[]
}

export interface OperatorCreateInput {
  name: string
  last_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  address: string | null
  employee_code: string | null
  labor_rate: number
  license_class: string | null
  license_expiration_date: string
}

export type OperatorUpdateInput = Partial<OperatorCreateInput>
