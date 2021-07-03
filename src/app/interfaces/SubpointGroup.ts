export interface ISubpointGroup {
    location: {
      address: string;
      latitude: number;
      longitude: number;
    },
    suggestion?: {
      address: string;
      latitude: number;
      longitude: number;
      pending: boolean;
      votes?: any;
    },
    id: string;
    members: Array<object>
}