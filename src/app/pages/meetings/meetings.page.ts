import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalMapComponent } from 'src/app/components/modal-map/modal-map.component';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.page.html',
  styleUrls: ['./meetings.page.scss'],
})
export class MeetingsPage implements OnInit {

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  }

  async showModalMap(){
    const modal = await this.modalController.create({
      component: ModalMapComponent
    });

    await modal.present();
  }

}
