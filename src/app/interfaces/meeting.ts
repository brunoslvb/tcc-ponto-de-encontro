import { ISubpointGroup } from "./SubpointGroup";

export interface IMeeting {
  id?: string;
  name?: string;
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  subpoints?: {
    group1?: ISubpointGroup;
    group2?: ISubpointGroup;
    group3?: ISubpointGroup;
    group4?: ISubpointGroup;
  };
  date?: string;
  time?: string;
  members?: any;
  owner?: string;
  numberOfMembers?: number;
}