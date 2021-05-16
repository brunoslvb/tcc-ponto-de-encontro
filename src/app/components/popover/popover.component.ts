import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { IMeeting } from 'src/app/interfaces/Meeting';
import { IUser } from 'src/app/interfaces/User';
import { ChatService } from 'src/app/services/chat.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';

import firebase from 'firebase/app';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {

  user: IUser = JSON.parse(atob(sessionStorage.getItem('user')));
  meeting: IMeeting;
  loading: any;

  constructor(
    private meetingService: MeetingService,
    private userService: UserService,
    private nav: NavController,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private chatService: ChatService
  ) { }

  ngOnInit() {}

  async leaveMeeting(){

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });
    await this.loading.present();

    try{

      await this.userService.removeMeetingFromUser(this.user.phone, this.meeting.id);
      
      if(this.meeting.numberOfMembers > 1){
        
        await this.meetingService.removeUserFromMeeting(this.meeting.id, this.user.phone);
        
        await this.meetingService.countNumberOfMembersFromMeeting(this.meeting.id);

        await this.chatService.saveMessage(this.meeting.id, {
          message: `${this.user.name} saiu do encontro`,
          type: "event",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

      } else {
        
        await this.meetingService.deleteChat(this.meeting.id);
        await this.meetingService.deleteMeeting(this.meeting.id);
      
      }

      await this.nav.navigateForward('/meetings', {
        replaceUrl: true
      });

    } catch(err) {
      console.error(err);
    } finally {
      await this.loading.dismiss();
    }

  }

}
