import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalMapComponent } from 'src/app/components/modal-map/modal-map.component';
import { IMeeting } from 'src/app/interfaces/meeting';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.page.html',
  styleUrls: ['./meetings.page.scss'],
})
export class MeetingsPage implements OnInit {

  meetings: Array<IMeeting>;

  constructor(
    private modalController: ModalController,
    private service: MeetingsService
  ) { }

  ngOnInit() {
    this.getAllMeetings();
  }

  async showModalMap(meeting: IMeeting){
    const modal = await this.modalController.create({
      component: ModalMapComponent,
      componentProps: { name: meeting.name }
    });

    await modal.present();
  }

  async getAllMeetings(){

    (await this.service.getAllMeetings()).subscribe(data => {
      
      this.meetings = data.map(e => {
      
        return {
          id: e.payload.doc.id,
          name: e.payload.doc.data()['name'],
          address: e.payload.doc.data()['address'],
          date: e.payload.doc.data()['date'],
          time: e.payload.doc.data()['time'],
        };
      
      });
      
      console.log(this.meetings);
    
    });
  }

}
