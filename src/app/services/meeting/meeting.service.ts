import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  constructor(
    private firestore: AngularFirestore
  ) { }

  getAllMeetings(){
    return this.firestore.collection('groups').snapshotChanges();
  }

  getById(id: string){
    return this.firestore.collection('groups').doc(id).snapshotChanges();
  }

  createMeeting(data){
    return this.firestore.collection('groups').add(data);
  }
}
