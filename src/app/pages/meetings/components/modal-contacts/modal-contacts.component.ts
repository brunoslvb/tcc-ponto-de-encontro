import { Component, OnInit } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';
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
  contacts: any[] = [];
  loading: any;

  selectedContacts: IUser[] = [];

  constructor(
    private userService: UserService,
    private meetingService: MeetingService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private statusBar: StatusBar
  ) { }

  ngOnInit() {
    
    // this.statusBar.backgroundColorByHexString('#F8F8F8');
    // this.statusBar.styleDefault();

    this.loadContacts();
  }

  getSelectedContacts(ev: any, contact: any) {

    if (ev.detail.checked) {
      this.selectedContacts.push(contact);
    } else {
      this.selectedContacts.splice(this.selectedContacts.indexOf(contact), 1);
    }

  }

  async loadContacts() {

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    const ids = [];

    await this.userService.getContacts().get().toPromise().then(response => {
      response.docs.forEach(async doc => ids.push(doc.id));      
    });

    const promises = ids.map(id => this.userService.getById(id).get().toPromise().then(response => response.data()));

    await Promise.all(promises).then(async (response) => {
      this.contacts = response.map((user: any) => user);
    });
        
    await this.checkContacts();
    
    await this.loading.dismiss();

  }

  async checkContacts() {
    
    // Object.keys(this.meeting.members).forEach(item => {
    //   console.log(item);
    // })
    
    // for (const item of Object.keys(this.meeting.members)) {
    //   console.log(item);
    // }

    let contacts = [];

    this.contacts.forEach(async contact => {
              
      for (const member of Object.keys(this.meeting.members)) {
        if (contact.phone === member) {
          contact.isInTheMeeting = true;
          break;
        }
      }

      contacts.push(contact)

    });

    this.contacts = contacts;

    console.log(this.contacts);
    

  }

  async closeModal() {
    await this.modalController.dismiss();
  }

  async submitModal() {
    await this.modalController.dismiss(this.selectedContacts);
  }

}
