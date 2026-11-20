export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  balance: number;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiError {
  error: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: { accessToken: string; refreshToken: string };
}

export type VehicleType = 'BIKE' | 'SCOOTER';
export type VehicleStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE';

export interface Vehicle {
  id: number;
  type: VehicleType;
  model: string;
  description?: string | null;
  pricePerHour: number;
  imageUrl?: string | null;
  status: VehicleStatus;
}

export interface Booking {
  id: number;
  userId: number;
  vehicleId: number;
  hours: number;
  totalPrice: number;
  startTime: string;
  endTime?: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  user?: Pick<User, 'id' | 'name' | 'email'>;
  vehicle?: Vehicle;
}