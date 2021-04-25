import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private collection: string = 'users';

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

  getContactsFromUser(userId: string) {
    return this.firestore.collection(this.collection).doc(userId).collection('contacts').get().toPromise();
  }

}
