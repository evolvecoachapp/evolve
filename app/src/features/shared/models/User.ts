/** Authenticated account identity — distinct from API transport shapes in `types/api`. */
export interface User {
  id: string;
  email: string;
  username: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
