export interface User {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'RECEPTIONIST' | 'HOUSEKEEPING' | 'CUSTOMER';
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RoomType {
    id: number;
    name: string;
    basePrice: number;
    capacity: number;
    images: string;
}
