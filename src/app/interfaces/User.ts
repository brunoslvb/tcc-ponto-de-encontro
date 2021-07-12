export interface IUser {
  uid?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  groups?: object;
  photo?: string;
  receiveNotifications?: boolean;
  tokenNotification?: string;
}