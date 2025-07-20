// Tenant table specific interfaces that extend the main Tenant interface
export interface TenantTableData {
  id: string
  name: string
  email: string
  property: string
  leaseEnds: string // ISO date string
  monthlyRent: number
  status: string
  avatar?: string
}

export interface TenantsTableResponse {
  tenants: TenantTableData[]
  total: number
  page: number
  limit: number
}

export interface TenantTableFilters {
  page?: number
  limit?: number
  search?: string
  status?: string
  property?: string
  leaseExpiry?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type TenantStatus = string

export interface StatusBadgeProps {
  status: TenantStatus
}

export interface ActionsMenuProps {
  tenantId: string
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export interface TenantRowProps {
  tenant: TenantTableData
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export interface TenantTableProps {
  searchTerm?: string
  onTenantView?: (id: string) => void
  onTenantEdit?: (id: string) => void
  onTenantDelete?: (id: string) => void
}