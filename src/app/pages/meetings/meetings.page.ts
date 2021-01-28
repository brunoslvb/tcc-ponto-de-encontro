import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
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

  loading: any;

  constructor(
    private meetingService: MeetingService,
    private userService: UserService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private nav: NavController
  ) { }

  ngOnInit() {
    this.getMeetingsOfUser();
  }

  async showModalMap(meeting: IMeeting){
    const modal = await this.modalController.create({
      component: ModalMapComponent,
      componentProps: {
        meeting
      }
    });

    await modal.present();
  }

  async getMeetingsOfUser(){

    console.log(sessionStorage.getItem('user'));

    this.userService.getById(sessionStorage.getItem('user')).subscribe((user: any) => {      

      console.log(user);

      let meetingsAux = [];
      
      user.payload.data().groups.forEach(group => {

        console.log(group);

        this.meetingService.getById(group).subscribe(doc => {

          console.log(doc.payload.data());

          let data: any = doc.payload.data();

          data.id = doc.payload.id;

          let aux = meetingsAux.findIndex(meeting => meeting.id === data.id);

          if(aux != -1){
            meetingsAux[aux] = data;
          } else {
            meetingsAux.push(data);
          }

        });

      });

      this.meetings = meetingsAux;

    });

  }

}
