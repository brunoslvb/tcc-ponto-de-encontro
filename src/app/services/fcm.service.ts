// import { Injectable } from '@angular/core';
// import { AngularFirestore } from '@angular/fire/firestore';

// import { Firebase } from '@ionic-native/firebase';
// import { Platform } from '@ionic/angular';

// @Injectable({
//   providedIn: 'root'
// })
// export class FcmService {

//   constructor(
//     private platform: Platform,
//     private firestore: AngularFirestore
//   ) { }


//   async getToken(){

//     let token;

//     if(this.platform.is('android')){
//       token = Firebase.getToken();
//     }

//     if(this.platform.is('ios')){
//       token = Firebase.getToken();
//       const permission = await Firebase.grantPermission();
//     }

//     return this.saveTokenToFirestore(token);

//   }

//   async saveTokenToFirestore(token){
    
//     if(!token) return;

//     return this.firestore.collection('devices').doc(token).set({
//       token,
//       userId: 'testUser'
//     });

//   }

//   async listenToNotifications(){
//     return Firebase.onNotificationOpen();
//   }

// }
