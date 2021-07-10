import { Injectable } from '@angular/core';
import { IMeeting } from '../interfaces/Meeting';
import { IUser } from '../interfaces/User';
import { AuthService } from './auth.service';
import { ChatService } from './chat.service';
import { MeetingService } from './meeting.service';
import { MessagingService } from './messaging.service';
import { UserService } from './user.service';

import firebase from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class FunctionsService {

  constructor(
    private authService: AuthService,
    private meetingService: MeetingService,
    private userService: UserService,
    private notificationService: MessagingService,
    private chatService: ChatService,
  ) { }

  async leaveMeeting(user: IUser, meeting: IMeeting) {

    await this.userService.removeMeetingFromUser(user.phone, meeting.id);

    if (meeting.numberOfMembers > 1) {

      const data = meeting;

      delete data.members[user.phone];

      console.log(data);

      if (meeting.owner === user.phone) {
        data.owner = Object.keys(data.members)[0];
      }

      await this.meetingService.update(meeting.id, data);

      await this.meetingService.countNumberOfMembersFromMeeting(meeting.id);

      await this.chatService.saveMessage(meeting.id, {
        message: `${user.name} saiu do encontro`,
        type: "event",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    } else {

      await this.meetingService.deleteChat(meeting.id);
      await this.meetingService.deleteMeeting(meeting.id);

    }

  }

  async addContactsToMeeting(contacts: IUser[], meeting: IMeeting){

    for (const contact of contacts) {

      const data = {
        members: {
          ...meeting.members,
          [contact.phone]: {}
        }
      }
      
      await this.meetingService.addUserToMeeting(meeting.id, {...meeting, ...data});
  
      await this.userService.addMeetingToUser(contact.phone, meeting.id);
  
      await this.chatService.saveMessage(meeting.id, {
        message: `${contact.name} foi adicionado ao encontro`,
        type: "event",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
  
      await this.meetingService.getById(meeting.id).get().toPromise().then(async response => {
        const data: any = response.data(); 
        meeting = data;
        meeting.id = response.id;
      });
      
    }

    await this.meetingService.countNumberOfMembersFromMeeting(meeting.id);

  }

}
