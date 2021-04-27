import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { IUser } from '../interfaces/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private collection: string = 'users';
  private currentUser: IUser = JSON.parse(sessionStorage.getItem('user'));

  constructor(
    private firestore: AngularFirestore
  ) { }

  addMeetingToUser(userId: string, meetingId: string){
    return this.firestore.collection(this.collection).doc(userId).update({ groups: firebase.firestore.FieldValue.arrayUnion(meetingId) });
  }

  getById(userId: string){
    return this.firestore.collection(this.collection).doc(userId).snapshotChanges();
  }

  removeMeetingFromUser(userId: string, meetingId: string){
    return this.firestore.collection(this.collection).doc(userId).update({ groups: firebase.firestore.FieldValue.arrayRemove(meetingId) });
  }

  getContacts() {
    return this.firestore.collection(this.collection).doc(this.currentUser.phone).collection('contacts').get().toPromise();
  }

  getContactById(userId: string) {
    return this.firestore.collection(this.collection).doc(userId).get().toPromise();
  }

  getContactByIdInUser(userId: string) {
    return this.firestore.collection(this.collection).doc(this.currentUser.phone).collection('contacts').doc(userId).get().toPromise();
  }

  addContact(user: IUser) {
    return this.firestore.collection(this.collection).doc(this.currentUser.phone).collection("contacts").doc(user.phone).set(user);
  }

}
