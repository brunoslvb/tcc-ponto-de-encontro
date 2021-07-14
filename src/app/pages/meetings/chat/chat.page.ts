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
import { FunctionsService } from 'src/app/services/functions.service';
import watchers from 'src/environments/globals';
import { MapService } from 'src/app/services/map.service';
import { StatusBar } from '@ionic-native/status-bar/ngx';

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
    private notificationService: MessagingService,
    private functionsService: FunctionsService,
    private mapService: MapService,
    private statusBar: StatusBar
  ) { }

  ngOnInit() {

    this.chatForm = this.builder.group({
      message: ['', Validators.required],
    });
  }
  
  ionViewWillEnter(){
    this.statusBar.backgroundColorByHexString('#4ECDC4');
    this.statusBar.styleLightContent();
    this.loadUser();
    this.getMessages();
    this.loadDataFromMeeting();
  }

  ionViewWillLeave(){
    this.dismissPopover();
    // this.listenerMeeting.unsubscribe();
  }

  async leaveMeeting(){

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });
    await this.loading.present();

    try{

      await this.functionsService.leaveMeeting(this.user, this.meeting);

      await this.nav.navigateForward('/meetings', {
        replaceUrl: true
      });

    } catch(err) {
      await this.presentToast('Problemas ao sair do grupo. Tente novamente mais tarde.');
    } finally {
      await this.loading.dismiss();
    }

  }

  async addContactsToMeeting(contacts: IUser[]){

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    try {
      await this.functionsService.addContactsToMeeting(contacts, this.meeting);
    
      await this.presentToast('Usuários adicionados com sucesso');
  
      await this.nav.navigateForward(`/meetings/${this.meeting.id}/map`);

    } catch (error) {
      await this.presentToast('Problemas ao adicionar contatos. Tente novamente mais tarde.');
    } finally {
      await this.loading.dismiss();
    }

  }

  async loadUser() {

    try {

      await this.userService.getById(this.user.phone).get().toPromise().then(async response => {

        const data: any = response.data();

        this.user = data;

      });

    } catch (error) {
      console.error(error);
    }
  }

  async loadDataFromMeeting(){
    const id = this.route.snapshot.paramMap.get("id");

    try{
      
      await this.meetingService.getById(id).get().toPromise().then(async response => {
        
        const data: any = response.data(); 
        
        this.meeting = data;
        
        this.meeting.id = response.id;
        
        await this.subpointOptionFunction();
        
        this.mapService.checkActiveLocations(this.user);
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

    await this.notificationService.buildDataToNotification(this.meeting.name, 'Você possui novas mensagens', Object.keys(this.meeting.members));

  }

}
