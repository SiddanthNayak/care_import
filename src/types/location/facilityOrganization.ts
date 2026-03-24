export interface FacilityOrganizationParent {
  id: string;
  name: string;
  parent?: FacilityOrganizationParent;
}

export interface FacilityOrganizationRead {
  id: string;
  name: string;
  description?: string;
  parent?: FacilityOrganizationParent;
  has_children?: boolean;
}
