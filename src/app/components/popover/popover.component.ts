import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavController, PopoverController } from '@ionic/angular';
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
    private chatService: ChatService,
    private popover: PopoverController
  ) { }

  ngOnInit() {}

  async leaveMeeting(){
    await this.popover.dismiss({}, 'leaveMeeting');
  }


}
