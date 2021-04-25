export interface IUser {
    uuid?: string;
    name?: string;
    email?: string;
    phone?: string;
    location?: {
      address?: string;
      latitude?: number;
      longitude?: number;
    }
}