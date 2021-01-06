import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';

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

  removeUserFromMeeting(meetingId, userId){
    return this.firestore.collection('groups').doc(meetingId).update({ members: firebase.firestore.FieldValue.arrayRemove(userId) });
  }

  decrementNumberofMembersFromMeeting(meetingId) {
    return this.firestore.collection('groups').doc(meetingId).update({ numberOfMembers: firebase.firestore.FieldValue.increment(-1) })
  }
}
