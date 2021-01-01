import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private firestore: AngularFirestore
  ) { }

  addGroupToUser(id, groupId){
    return this.firestore.collection('users').doc(id).update({ groups: firebase.firestore.FieldValue.arrayUnion(groupId) });
  }

  getById(user){
    return this.firestore.collection('users').doc(user).snapshotChanges();
  }
}
