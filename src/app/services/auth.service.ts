import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import firebase from 'firebase';
import { IUser } from '../interfaces/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private collection: string = 'users';

  constructor(
    private firestore: AngularFirestore
  ) { }


  signInWithPhoneNumber(phoneNumber: string, appVerifier: firebase.auth.ApplicationVerifier){
    return firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier);
  }

  saveUserInFirestore(user: IUser){
    return this.firestore.collection(this.collection).doc(user.uuid).set(user);
  }

}
