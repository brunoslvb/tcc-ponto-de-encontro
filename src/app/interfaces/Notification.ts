export interface INotification {
  notification?: {
    title?: string;
    body?: string;
  };
  registration_ids?: string[];
}