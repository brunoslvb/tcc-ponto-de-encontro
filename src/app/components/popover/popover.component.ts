import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { IMeeting } from 'src/app/interfaces/meeting';
import { MeetingService } from 'src/app/services/meeting/meeting.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-popover',
  templateUrl: './popover.component.html',
  styleUrls: ['./popover.component.scss'],
})
export class PopoverComponent implements OnInit {

  meeting: IMeeting;
  loading: any;

  constructor(
    private meetingService: MeetingService,
    private userService: UserService,
    private nav: NavController,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) { }

  ngOnInit() {}

  async leaveMeeting(){

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });
    await this.loading.present();

    try{
      await this.meetingService.removeUserFromMeeting(this.meeting.id, sessionStorage.getItem('user'));

      await this.meetingService.countNumberOfMembersFromMeeting(this.meeting.id);

      await this.userService.removeMeetingFromUser(sessionStorage.getItem('user'), this.meeting.id);

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
