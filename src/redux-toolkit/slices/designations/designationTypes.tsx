export interface Designation {
  id: string | null;
  designation: string | null;
  role_id: string | null
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DesignationState {
  designation: Designation[];
  totalCount: number;
  loading: boolean;
  error: string | null;
}
