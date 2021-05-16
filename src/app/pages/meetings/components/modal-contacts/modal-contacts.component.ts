import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { IMeeting } from 'src/app/interfaces/Meeting';
import { IUser } from 'src/app/interfaces/User';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-modal-contacts',
  templateUrl: './modal-contacts.component.html',
  styleUrls: ['./modal-contacts.component.scss'],
})
export class ModalContactsComponent implements OnInit {

  meeting: IMeeting;
  contacts: any = [];
  loading: any;

  selectedContacts: IUser[] = [];

  constructor(
    private userService: UserService,
    private meetingService: MeetingService,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.loadContactsFromUser();
  }

  getSelectedContacts(ev: any, contact: any) {

    if(ev.detail.checked) {
      this.selectedContacts.push(contact);
    } else {
      this.selectedContacts.splice(this.selectedContacts.indexOf(contact), 1);
    }

  }

  async loadContactsFromUser(){
    
    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    await this.userService.getContacts().get().toPromise().then(response => {

      let contact: any;

      response.docs.forEach(async doc => {
        
        contact = doc.data();

        for (let i = 0; i < this.meeting.members.length; i++) {
          if(contact.phone === this.meeting.members[i]) {
            contact.isInTheMeeting = true;
            break;
          }
        }

        this.contacts.push(contact);
      });

    });

    await this.loading.dismiss();

  }

  async closeModal(){
    await this.modalController.dismiss();
  }

  async submitModal(){
    await this.modalController.dismiss(this.selectedContacts);
  }

}
