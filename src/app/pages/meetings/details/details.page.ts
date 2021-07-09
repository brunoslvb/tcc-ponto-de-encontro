import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NavController, PopoverController, LoadingController, ToastController, ModalController, AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { PopoverComponent } from 'src/app/components/popover/popover.component';
import { IMeeting } from 'src/app/interfaces/Meeting';
import { IMessage } from 'src/app/interfaces/Message';
import { IUser } from 'src/app/interfaces/User';
import { ChatService } from 'src/app/services/chat.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { MessagingService } from 'src/app/services/messaging.service';
import { UserService } from 'src/app/services/user.service';
import { ModalContactsComponent } from '../components/modal-contacts/modal-contacts.component';
import firebase from 'firebase/app';

@Component({
  selector: 'app-details',
  templateUrl: './details.page.html',
  styleUrls: ['./details.page.scss'],
})
export class DetailsPage implements OnInit {

  user: IUser = JSON.parse(atob(sessionStorage.getItem("user")));

  chatForm: FormGroup;

  messages: Array<IMessage> = [];

  members: Array<any> = [];

  contacts: any = [];

  subpointGroup: any;
  subpointOption: any = {
    active: false,
    color: 'white'
  };

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

  listenerMeeting: Subscription;
  listenerChat: Subscription;

  constructor(
    private nav: NavController,
    private route: ActivatedRoute,
    private meetingService: MeetingService,
    private chatService: ChatService,
    private userService: UserService,
    private popoverController: PopoverController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController,
    private alertController: AlertController,
    private notificationService: MessagingService
  ) { }

  ngOnInit() {
  }
  
  ionViewWillEnter(){
    this.load();
  }

  ionViewWillLeave(){
    this.dismissPopover();
  }

  async load(){
    await this.loadMeeting();
    await this.loadMembers();
    await this.loadContacts();
  }

  async leaveMeeting(){

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });
    await this.loading.present();

    try{

      await this.userService.removeMeetingFromUser(this.user.phone, this.meeting.id);
      
      if(this.meeting.numberOfMembers > 1){
        
        await this.meetingService.removeUserFromMeeting(this.meeting.id, this.user.phone);
        
        await this.meetingService.countNumberOfMembersFromMeeting(this.meeting.id);

        await this.chatService.saveMessage(this.meeting.id, {
          message: `${this.user.name} saiu do encontro`,
          type: "event",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

      } else {
        
        await this.meetingService.deleteChat(this.meeting.id);
        await this.meetingService.deleteMeeting(this.meeting.id);
      
      }

      await this.nav.navigateForward('/meetings', {
        replaceUrl: true
      });

    } catch(err) {
      console.error(err);
    } finally {
      await this.loading.dismiss();
    }

  }

  async addContactsToMeeting(contacts: IUser[]){

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    await contacts.forEach(async (contact: any) => {

      await this.meetingService.addUserToMeeting(this.meeting.id, contact.phone);

      await this.userService.addMeetingToUser(contact.phone, this.meeting.id);

      await this.chatService.saveMessage(this.route.snapshot.paramMap.get("id"), {
        message: `${contact.name} foi adicionado ao encontro`,
        type: "event",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    });

    await this.meetingService.countNumberOfMembersFromMeeting(this.meeting.id);

    await this.loading.dismiss();

    await this.presentToast('Usuários adicionados com sucesso');

    await this.nav.navigateForward(`/meetings/${this.meeting.id}/map`);

  }

  async loadMeeting(){
    const id = this.route.snapshot.paramMap.get("id");

    try{
      
      await this.meetingService.getById(id).get().toPromise().then(async response => {
        
        const data: any = response.data(); 
        
        this.meeting = data;
        
        this.meeting.id = response.id;
        
        await this.subpointOptionFunction();
      });

        
    } catch(error) {
      console.error(error);
    } 

  }

  async loadContacts(){

    await this.userService.getContacts().get().toPromise().then(response => {

      this.contacts = this.members.map(member => {

        response.docs.forEach(async doc => {

          console.log(`${doc.id} === ${member.phone}`);

          if(doc.id == member.phone) {
            member.myContact = true;
          } else {
            member.myContact = false;
          }

        });

        return member;
      });      

    });

  }

  async loadMembers(){
    
    const promises = this.meeting.members.map(member => this.userService.getById(member).get().toPromise().then(response => response.data()));

    await Promise.all(promises).then(async (response) => {
      this.members = response.map((user: any) => user);
    });

  }
  
  async subpointOptionFunction(){
    this.subpointGroup = await this.meetingService.getSubpointGroup(this.route.snapshot.paramMap.get("id"));    
    if(this.meeting.subpoints[this.subpointGroup].members.length > 1) {
      this.subpointOption.active = true;
      if(this.meeting.subpoints[this.subpointGroup].suggestion.pending === true && this.meeting.subpoints[this.subpointGroup].suggestion.votes[this.user.phone] === undefined){
        this.subpointOption.color = 'warning';
      } else {
        this.subpointOption.color = 'white';
      }
    }
  }

  async showPopover(ev: any) {

    this.popover = await this.popoverController.create({
      
      component: PopoverComponent,
      componentProps: {
        meeting: this.meeting,
        chatId: this.route.snapshot.paramMap.get("id")
      },
      event: ev,
      translucent: true
    });

    await this.popover.present();

    this.popover.onDidDismiss().then(async response => {
      
      switch (response.role) {
        case 'leaveMeeting':
          this.leaveMeeting();
          break;
      
        default:
          return;
      }

    });

  }

  dismissPopover(){
    if (this.popover) {
      this.popover.dismiss().then(() => { this.popover = null; });
    }
  }

  async removeUser(user){

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });
    await this.loading.present();

    try{

      await this.userService.removeMeetingFromUser(user.phone, this.meeting.id);
      
      await this.meetingService.removeUserFromMeeting(this.meeting.id, user.phone);
      
      await this.meetingService.countNumberOfMembersFromMeeting(this.meeting.id);

      await this.chatService.saveMessage(this.meeting.id, {
        message: `${user.name} foi removido do encontro`,
        type: "event",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      await this.presentToast(`${user.name} foi removido com sucesso`);

      await this.load();

    } catch(err) {
      console.error(err);
    } finally {
      await this.loading.dismiss();
    }
  }

  async alertConfirmRemove(user){

    const alert = await this.alertController.create({
      header: 'Remover',
      message: 'Tem certeza que deseja remover este usuário do encontro?',
      backdropDismiss: true,
      buttons: [
        {
          text: 'Aceitar',
          handler: () => this.removeUser(user)
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        },
      ],
    });

    await alert.present();

  }

  async back(){
    await this.nav.back();
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
