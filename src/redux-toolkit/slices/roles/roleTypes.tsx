export interface Role {
  id: string | null;
  role: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface RoleState {
  role: Role[];
  totalCount: number;
  loading: boolean;
  error: string | null;
}
