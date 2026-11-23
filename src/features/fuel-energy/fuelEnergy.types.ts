export interface FuelEntry {
  id: string
  vehicle_id: string
  created_by_name: string
  created_by_admin_id: string | null
  date: string
  odometer: number
  vendor: string
  fuel_type: string
  previous_entry_id: string | null
  previous_entry_date: string | null
  volume: string
  fuel_price: string
  total_price: string
  created_at: string
}

export interface ChargingEntry {
  id: string
  vehicle_id: string
  created_by_name: string
  created_by_admin_id: string | null
  vendor: string
  charging_started_at: string
  charging_ended_at: string
  charging_duration_minutes: number
  odometer: number
  total_energy_kwh: string
  energy_price: string
  energy_cost: string
  total_cost: string
  previous_entry_id: string | null
  previous_entry_date: string | null
  created_at: string
}

export type HistoryKind = 'fuel' | 'energy'

export interface FuelCreateInput {
  vehicle_id: string
  date: string
  odometer: number
  vendor: string
  fuel_type: string
  volume: number
  total_price: number
}

export interface ChargingCreateInput {
  vehicle_id: string
  vendor: string
  charging_started_at: string
  charging_ended_at: string
  odometer: number
  total_energy_kwh: number
  energy_price: number
}
