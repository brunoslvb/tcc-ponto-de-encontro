import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { ModalMapComponent } from 'src/app/components/modal-map/modal-map.component';
import { IMeeting } from 'src/app/interfaces/meeting';
import { MeetingService } from 'src/app/services/meeting/meeting.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {

  meetings: Array<IMeeting>;

  loading: any;

  constructor(
    private meetingService: MeetingService,
    private userService: UserService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private nav: NavController
  ) { sessionStorage.setItem("user", "brunosilva2365@gmail.com"); }

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

    this.userService.getById(sessionStorage.getItem('user')).subscribe((user: any) => {      

      let meetingsAux = [];
      
      user.payload.data().groups.forEach(group => {

        this.meetingService.getById(group).subscribe(doc => {

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
