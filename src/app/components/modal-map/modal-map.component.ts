import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-map',
  templateUrl: './modal-map.component.html',
  styleUrls: ['./modal-map.component.scss'],
})
export class ModalMapComponent implements OnInit {

  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  async closeModalMap(){
    await this.modalController.dismiss();
  }

}
