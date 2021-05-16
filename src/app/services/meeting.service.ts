import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  private collection: string = 'meetings';

  constructor(
    private firestore: AngularFirestore
  ) { }

  getAllMeetings(){
    return this.firestore.collection(this.collection).snapshotChanges();
  }

  getById(meetingId: string){
    return this.firestore.collection(this.collection).doc(meetingId).snapshotChanges();
  }

  createMeeting(meeting: Object){
    return this.firestore.collection(this.collection).add(meeting);
  }

  addUserToMeeting(meetingId: string, userId: string){
    return this.firestore.collection(this.collection).doc(meetingId).update({ members: firebase.firestore.FieldValue.arrayUnion(userId) });
  }

  removeUserFromMeeting(meetingId: string, userId: string){
    return this.firestore.collection(this.collection).doc(meetingId).update({ members: firebase.firestore.FieldValue.arrayRemove(userId) });
  }

  async countNumberOfMembersFromMeeting(meetingId: string) {

    let doc: any;

    await this.firestore.collection(this.collection).doc(meetingId).get().toPromise().then(response => {

      doc = response.data();
      
    });
    
    return this.firestore.collection(this.collection).doc(meetingId).update({ numberOfMembers: doc.members.length });

  }

  async deleteChat(meetingId) {
    return this.firestore.collection(this.collection).doc(meetingId).collection('chat').get().toPromise().then(data => {
      data.docs.forEach(doc => {
        doc.ref.delete()
      })
    })
  }

  async deleteMeeting(meetingId) {
    return this.firestore.collection(this.collection).doc(meetingId).delete();
  }

}
