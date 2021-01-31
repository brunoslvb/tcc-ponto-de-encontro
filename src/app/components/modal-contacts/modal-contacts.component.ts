import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController } from '@ionic/angular';
import { IMeeting } from 'src/app/interfaces/meeting';
import { MeetingService } from 'src/app/services/meeting/meeting.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-modal-contacts',
  templateUrl: './modal-contacts.component.html',
  styleUrls: ['./modal-contacts.component.scss'],
})
export class ModalContactsComponent implements OnInit {

  meeting: IMeeting;
  contacts: Array<any> = [];
  loading: any;

  selectedContacts: Array<string> = [];

  constructor(
    private userService: UserService,
    private meetingService: MeetingService,
    private loadingController: LoadingController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.loadContactsFromUser();
  }

  getSelectedContacts(ev: any) {

    if(ev.detail.checked) {
      this.selectedContacts.push(ev.detail.value);
    } else {
      this.selectedContacts.splice(this.selectedContacts.indexOf(ev.detail.value), 1);
    }

  }

  async loadContactsFromUser(){
    
    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    await this.userService.getContactsFromUser(sessionStorage.getItem('user')).then(response => {

      let contact: any;

      response.docs.forEach(async doc => {
        
        contact = doc.data();

        for (let i = 0; i < this.meeting.members.length; i++) {
          if(contact.email === this.meeting.members[i]) {
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
