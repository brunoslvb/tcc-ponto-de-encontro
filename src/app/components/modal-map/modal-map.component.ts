import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IMeeting } from 'src/app/interfaces/meeting';

@Component({
  selector: 'app-modal-map',
  templateUrl: './modal-map.component.html',
  styleUrls: ['./modal-map.component.scss'],
})
export class ModalMapComponent implements OnInit {

  // @Input() meeting: IMeeting;
  @Input() name: string;

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {}

  async closeModalMap(){
    await this.modalController.dismiss();
  }

}
