export interface IMeeting {
  id: string;
  name: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
  }
  date: string;
  time: string;
  members: Array<string>;
  numberOfmembers: number;
}