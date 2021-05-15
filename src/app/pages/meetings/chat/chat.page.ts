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

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  user: IUser = JSON.parse(sessionStorage.getItem("user"));

  chatForm: FormGroup;

  messages: Array<IMessage> = [];

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
    private chatService: ChatService,
    private userService: UserService,
    private popoverController: PopoverController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController,
    private builder: FormBuilder
  ) { }

  ngOnInit() {

    this.chatForm = this.builder.group({
      message: ['', Validators.required],
    });

    this.getMessages();

    this.loadDataFromMeeting();
  }

  ionViewWillLeave(){
    this.dismissPopover();
  }

  async addContactsToMeeting(contacts: IUser[]){
    this.dismissPopover();

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

  async getMessages(){

    let messages: Array<IMessage> = [];

    await this.chatService.getMessages(this.route.snapshot.paramMap.get("id")).subscribe(async (response: any) => {  
      
      messages = [];

      response.forEach((item: any) => {

        const data: IMessage = item.payload.doc.data();
        
        data.myMessage = data.from === this.user.phone;

        messages.push(data);
      });

      this.messages = messages;

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

  }

}
