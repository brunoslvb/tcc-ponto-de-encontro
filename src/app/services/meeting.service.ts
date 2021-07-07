import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import { IMeeting } from '../interfaces/Meeting';
import { IUser } from '../interfaces/User';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {

  user: IUser = JSON.parse(atob(sessionStorage.getItem('user')));
  private collection: string = 'meetings';

  constructor(
    private firestore: AngularFirestore,
    private userService: UserService
  ) { }

  getAllMeetings(){
    return this.firestore.collection(this.collection).snapshotChanges();
  }

  getById(meetingId: string){
    return this.firestore.collection(this.collection).doc(meetingId);
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

  update(meetingId: string, data: object) {
    return this.firestore.collection(this.collection).doc(meetingId).update(data);
  }

  async countNumberOfMembersFromMeeting(meetingId: string) {

    let doc: any;

    await this.firestore.collection(this.collection).doc(meetingId).get().toPromise().then(response => {

      doc = response.data();
      
    });
    
    return this.firestore.collection(this.collection).doc(meetingId).update({ numberOfMembers: doc.members.length });

  }

  async getSubpointGroup(meetingId) {
    return new Promise((resolve, reject) => {
      this.firestore.collection(this.collection).doc(meetingId).get().toPromise().then(async (response: any) => {
        console.log(response.data());
        Object.keys(response.data().subpoints).forEach(item => {
          response.data().subpoints[item].members.forEach(member => {
            if(this.user.phone === member.phone){
              resolve(item);
            }
          });
        });
        reject();
      });
    });
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
