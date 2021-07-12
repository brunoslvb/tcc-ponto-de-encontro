import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFirestore } from '@angular/fire/firestore';
import { IUser } from '../interfaces/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private collection: string = 'users';
  private currentUser: IUser = JSON.parse(atob(sessionStorage.getItem('user')));

  constructor(
    private firestore: AngularFirestore
  ) { }

  addMeetingToUser(userId: string, data: object){
    return this.firestore.collection(this.collection).doc(userId).update(data);
  }

  getById(userId: string){
    return this.firestore.collection(this.collection).doc(userId);
  }

  removeMeetingFromUser(userId: string, data: object){
    return this.firestore.collection(this.collection).doc(userId).update(data);
  }

  getContacts() {
    return this.firestore.collection(this.collection).doc(this.currentUser.phone).collection('contacts');
  }

  getContactByIdInUser(userId: string) {
    return this.firestore.collection(this.collection).doc(this.currentUser.phone).collection('contacts').doc(userId).get().toPromise();
  }

  addContact(user: IUser) {
    return this.firestore.collection(this.collection).doc(this.currentUser.phone).collection("contacts").doc(user.phone).set({});
  }

  update(user: IUser){
    return this.firestore.collection(this.collection).doc(this.currentUser.phone).update(user);
  }

  deleteContact(contactId){
    return this.firestore.collection(this.collection).doc(this.currentUser.phone).collection('contacts').doc(contactId).delete();
  }

}
