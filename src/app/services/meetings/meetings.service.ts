import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class MeetingsService {

  constructor(
    private firestore: AngularFirestore
  ) { }

  async getAllMeetings(){
    return this.firestore.collection('groups').snapshotChanges();
  }

  async getById(id: string){
    return this.firestore.collection('groups').doc(id).get();
  }

  async createMeeting(id, data){
    await this.firestore.collection('groups').doc().set(data);
  }
}
