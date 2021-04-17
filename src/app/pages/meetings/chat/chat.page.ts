import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, PopoverController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { ModalContactsComponent } from 'src/app/components/modal-contacts/modal-contacts.component';
import { PopoverComponent } from 'src/app/components/popover/popover.component';
import { IMeeting } from 'src/app/interfaces/meeting';
import { MeetingService } from 'src/app/services/meeting/meeting.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  meeting: IMeeting = {
    id: "",
    name: "",
    location: {
      address: "",
      latitude: 0,
      longitude: 0,
    },
    date: "",
    time: "",
    members: [],
    numberOfMembers: 0,
  };

  popover: any = null;
  loading: any;

  constructor(
    private nav: NavController,
    private route: ActivatedRoute,
    private meetingService: MeetingService,
    private userService: UserService,
    private popoverController: PopoverController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.loadDataFromMeeting();
  }

  ionViewWillLeave(){
    this.dismissPopover();
  }

  async addContactsToMeeting(contacts: Array<string>){
    this.dismissPopover();

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    await contacts.forEach(async contact => {

      await this.meetingService.addUserToMeeting(this.meeting.id, contact);

      await this.userService.addMeetingToUser(contact, this.meeting.id);

    });

    await this.meetingService.countNumberOfMembersFromMeeting(this.meeting.id);

    await this.loading.dismiss();

    await this.presentToast('Usuários adicionados com sucesso');

  }

  async loadDataFromMeeting(){
    const id = this.route.snapshot.paramMap.get("id");

    try{
      
      await this.meetingService.getById(id).subscribe(async response => {

        const data: any = response.payload.data(); 
        
        this.meeting = data;
        
        this.meeting.id = response.payload.id;

      });

    } catch(error) {
      console.error(error);
    } 
  }

  async showPopover(ev: any) {

    this.popover = await this.popoverController.create({
      component: PopoverComponent,
      componentProps: {
        meeting: this.meeting
      },
      event: ev,
      translucent: true
    });

    await this.popover.present();

    this.popover.onDidDismiss().then(async response => {
      
      console.log(response);

      if (!response.data || !response.data.length){
        console.log('Nenhum contato a ser adicionado')
        return;
      }

      console.log(response.data);

      await this.addContactsToMeeting(response.data);

    });

  }

  dismissPopover(){
    if (this.popover) {
      this.popover.dismiss().then(() => { this.popover = null; });
    }
  }

  async back(){
    await this.nav.navigateForward('/meetings');
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  async showModalContacts() {
    const modal = await this.modalController.create({
      component: ModalContactsComponent,
      componentProps: {
        meeting: this.meeting
      }
    });
    await modal.present();

    modal.onWillDismiss().then(async response => {

      if (!response.data || !response.data.length){
        console.log('Nenhum contato a ser adicionado')
        return;
      }

      await this.addContactsToMeeting(response.data);

    });

  }

}
