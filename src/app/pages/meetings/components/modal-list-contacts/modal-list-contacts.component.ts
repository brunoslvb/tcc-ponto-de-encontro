import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { IUser } from 'src/app/interfaces/User';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-modal-list-contacts',
  templateUrl: './modal-list-contacts.component.html',
  styleUrls: ['./modal-list-contacts.component.scss'],
})
export class ModalListContactsComponent implements OnInit {

  user: IUser;
  contacts: any = [];
  loading: any;

  selectedContacts: IUser[] = [];

  constructor(
    private userService: UserService,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.loadContactsFromUser();
  }


  async loadContactsFromUser(){
    
    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    await this.userService.getContacts().then(response => {

      let contact: any;

      response.docs.forEach(async doc => {
        
        contact = doc.data();

        this.contacts.push(contact);
      });

    });

    console.log(this.contacts);
    

    await this.loading.dismiss();

  }

  async closeModal(){
    await this.modalController.dismiss();
  }

  async submitModal(){
    await this.modalController.dismiss(this.selectedContacts);
  }

}
