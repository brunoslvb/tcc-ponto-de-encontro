import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, PopoverController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { ModalContactsComponent } from '../components/modal-contacts/modal-contacts.component';
import { PopoverComponent } from 'src/app/components/popover/popover.component';
import { IMeeting } from 'src/app/interfaces/Meeting';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from 'src/app/services/chat.service';
import { IMessage } from 'src/app/interfaces/Message';
import firebase from 'firebase/app';
import { IUser } from 'src/app/interfaces/User';
import { Observable, Subscription } from 'rxjs';
import { MessagingService } from 'src/app/services/messaging.service';
import { INotification } from 'src/app/interfaces/Notification';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  user: IUser = JSON.parse(atob(sessionStorage.getItem("user")));

  chatForm: FormGroup;

  messages: Array<IMessage> = [];

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
    private builder: FormBuilder,
    private notificationService: MessagingService
  ) { }

  ngOnInit() {

    this.chatForm = this.builder.group({
      message: ['', Validators.required],
    });
    
  }
  
  ionViewWillEnter(){
    this.getMessages();
    this.loadDataFromMeeting();
  }

  ionViewWillLeave(){
    this.dismissPopover();
    this.listenerMeeting.unsubscribe();
  }

  async leaveMeeting(){

    this.listenerMeeting.unsubscribe();
    this.listenerChat.unsubscribe();

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
    // this.dismissPopover();

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

  async loadDataFromMeeting(){
    const id = this.route.snapshot.paramMap.get("id");

    try{
      
      this.listenerMeeting = await this.meetingService.getById(id).snapshotChanges().subscribe(async response => {
        
        const data: any = response.payload.data(); 
        
        this.meeting = data;
        
        this.meeting.id = response.payload.id;
        
        await this.subpointOptionFunction();
      });

        
    } catch(error) {
      console.error(error);
    } 

  }

  
  async subpointOptionFunction(){
    console.log('Ta aqui');
    this.subpointGroup = await this.meetingService.getSubpointGroup(this.route.snapshot.paramMap.get("id"));    
    console.log(this.subpointGroup);
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

  async back(){
    await this.nav.navigateForward('/meetings', { animationDirection: 'back' });
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

  async getMessages(){

    let messages: Array<IMessage> = [];

    this.listenerChat = await this.chatService.getMessages(this.route.snapshot.paramMap.get("id")).subscribe(async (response: any) => {  
    
      messages = [];

      response.forEach((item: any) => {

        const data: IMessage = item.payload.doc.data();
        
        data.myMessage = data.from === this.user.phone;

        messages.push(data);
      });

      this.messages = messages;

      console.log("Passou aqui");
      
    });

  }

  async sendMessage(){
    
    const data = {
      from: this.user.phone,
      fromName: this.user.name,
      message: this.chatForm.value.message,
      type: "message",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }

    this.chatForm.reset();
    
    await this.chatService.saveMessage(this.route.snapshot.paramMap.get("id"), data);

    const promises = this.meeting.members.map(member => this.userService.getById(member).get().toPromise().then(response => response.data()));

    Promise.all(promises).then((response) => {
      
      const tokens = response.map((user: any) => {
        return user.receiveNotifications ? user.tokenNotification : null;
      });
      
      const notification: INotification = {
        notification: {
          title: this.meeting.name,
          body: 'Você possui novas mensagens',
        },
        registration_ids: tokens
      }
  
      this.notificationService.sendNotification(notification);

    });    

  }

}
