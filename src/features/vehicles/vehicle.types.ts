export type VehicleStatus =
  | 'ACTIVE'
  | 'IN_MAINTENANCE'
  | 'DECOMMISSIONED'

export type VehiclePropulsionType = 'FUEL' | 'ELECTRIC' | 'HYBRID'

export interface Vehicle {
  id: string
  name: string
  status: VehicleStatus
  type: string
  propulsion_type: VehiclePropulsionType
  fuel_type: string | null
  vin_sn: string
  license_plate: string
  year: number
  make: string
  model: string
  current_odometer: number
  insurance_policy_number: string | null
  insurance_expiration: string | null
  circulation_card_number: string | null
  verification_expiration: string | null
  created_at: string
}

export interface VehicleListResponse {
  vehicles: Vehicle[]
}

export interface VehicleCreateInput {
  name: string
  status: VehicleStatus
  type: string
  propulsion_type: VehiclePropulsionType
  fuel_type: string | null
  vin_sn: string
  license_plate: string
  year: number
  make: string
  model: string
  current_odometer: number
  insurance_policy_number: string | null
  insurance_expiration: string | null
  circulation_card_number: string | null
  verification_expiration: string | null
}

export type VehicleUpdateInput = Partial<VehicleCreateInput>
