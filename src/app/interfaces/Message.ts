import firebase from 'firebase/app';

export interface IMessage {
  from: string;
  fromName: string;
  createdAt: firebase.firestore.FieldValue;
  message: string;
  myMessage: boolean;
  type?: string;
}