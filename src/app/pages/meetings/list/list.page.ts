import { Component, OnInit } from '@angular/core';
import { LoadingController, MenuController, ModalController, NavController } from '@ionic/angular';
import { ModalMapComponent } from 'src/app/components/modal-map/modal-map.component';
import { IMeeting } from 'src/app/interfaces/Meeting';
import { IUser } from 'src/app/interfaces/User';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {

  meetings: Array<IMeeting> = [];

  loading: any;

  user: IUser = JSON.parse(sessionStorage.getItem('user'));

  constructor(
    private meetingService: MeetingService,
    private userService: UserService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private nav: NavController,
    private menu: MenuController,
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
    
    this.userService.getById(this.user.phone).subscribe((user: any) => {      

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

  lala() {
    this.menu.enable(true, 'main-menu');
    this.menu.open('main-menu');
  }

}
