import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalMapComponent } from 'src/app/components/modal-map/modal-map.component';
import { IMeeting } from 'src/app/interfaces/meeting';
import { MeetingService } from 'src/app/services/meeting/meeting.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.page.html',
  styleUrls: ['./meetings.page.scss'],
})
export class MeetingsPage implements OnInit {

  meetings: Array<IMeeting>;

  constructor(
    private modalController: ModalController,
    private meetingService: MeetingService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.getMeetingsOfUser();
  }

  async showModalMap(meeting: IMeeting){
    const modal = await this.modalController.create({
      component: ModalMapComponent,
      componentProps: { name: meeting.name }
    });

    await modal.present();
  }

  async getMeetingsOfUser(){
    
    this.userService.getById(sessionStorage.getItem('user')).subscribe((user: any) => {

      let meetingsAux = [];

      user.payload.data().groups.forEach(group => {
        this.meetingService.getById(group).subscribe(doc => {
          let data: any = doc.payload.data();

          data.id = doc.payload.id;

          meetingsAux.push(data);
        });
      });

      this.meetings = meetingsAux;
    });
  }

}
