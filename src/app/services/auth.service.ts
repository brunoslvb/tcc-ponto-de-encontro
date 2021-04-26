import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { LoadingController, NavController } from '@ionic/angular';
import Firebase from 'firebase/app';
import { Observable } from 'rxjs';
import { IUser } from '../interfaces/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  loading: any;
  collection: string = 'users';
  isLoggedIn: Observable<Firebase.User>;

  constructor(
    private firestore: AngularFirestore,
    private loadingController: LoadingController,
    private nav: NavController,
    private auth: AngularFireAuth,
  ) { this.isLoggedIn = this.auth.authState; }


  signInWithPhoneNumber(phoneNumber: string, appVerifier: Firebase.auth.ApplicationVerifier){
    return this.auth.signInWithPhoneNumber(phoneNumber, appVerifier);
  }

  saveUserInFirestore(user: IUser){
    return this.firestore.collection(this.collection).doc(user.phone).set(user);
  }

  findUserById(id: string){
    return this.firestore.collection(this.collection).doc(id).get().toPromise();
  }

  async isUserLoggedIn(){

    this.loading = await this.loadingController.create({ spinner: 'crescent' });
    
    await this.loading.present();

    try {
      await this.isLoggedIn.subscribe(async user => {
        
        if(user){

          const data: any = (await this.findUserById(user.phoneNumber)).data();

          sessionStorage.setItem('user', JSON.stringify({
            name: data.name,
            phone: data.phone,
            email: data.email
          }));

          this.nav.navigateForward('meetings');
        }
      });      
    } catch (err) {
      console.error(err);
    }

    await this.loading.dismiss();
  }

}
