import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Environment, GoogleMap, GoogleMapOptions, GoogleMaps, GoogleMapsEvent } from '@ionic-native/google-maps';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavController, LoadingController, Platform, ToastController, AlertController } from '@ionic/angular';
import firebase from 'firebase';
import { Subscription } from 'rxjs';
import { IMeeting } from 'src/app/interfaces/Meeting';
import { INotification } from 'src/app/interfaces/Notification';
import { ISubpointGroup } from 'src/app/interfaces/SubpointGroup';
import { IUser } from 'src/app/interfaces/User';
import { ChatService } from 'src/app/services/chat.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { MessagingService } from 'src/app/services/messaging.service';
import { UserService } from 'src/app/services/user.service';

declare var google;

@Component({
  selector: 'app-subpoint',
  templateUrl: './subpoint.page.html',
  styleUrls: ['./subpoint.page.scss'],
})

export class SubpointPage implements OnInit {

  loading: any;

  listenerMeeting: Subscription;

  registerForm: FormGroup;
  addresses: Array<{
    description: string;
  }> = [];
  coords: Array<Number>;

  user: IUser = JSON.parse(atob(sessionStorage.getItem('user')));
  meeting: IMeeting;
  subpointGroup: any;
  pendingSubpoint: any;
  activeSubpoint: any;

  private googleMapsPlaces = new google.maps.places.AutocompleteService();
  private googleMapsGeocoder = new google.maps.Geocoder();

  constructor(
    private builder: FormBuilder,
    private nav: NavController,
    private meetingService: MeetingService,
    private userService: UserService,
    private chatService: ChatService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private route: ActivatedRoute,
    private notificationService: MessagingService,
    private statusBar: StatusBar
  ) { }

  ngOnInit() {
    this.registerForm = this.builder.group({
      address: ['', Validators.required],
    });
  }
  
  ionViewWillEnter(){
    this.statusBar.backgroundColorByHexString('#4ECDC4');
    this.statusBar.styleLightContent();
    this.loadMeeting();
  }

  ionViewWillLeave(){
    this.listenerMeeting.unsubscribe();
  }
  
  async loadMeeting() {
    
    const id = this.route.snapshot.paramMap.get("id");
    
    try {
      
      this.listenerMeeting = await this.meetingService.getById(id).snapshotChanges().subscribe(async response => {
        
        const data: any = response.payload.data();
        
        this.meeting = data;
        
        this.meeting.id = response.payload.id;
        
        this.subpointGroup = await this.meetingService.getSubpointGroup(this.meeting.id);        
        
        this.checkPendingSubpoints();
        this.checkActiveSubpoints();
        
        this.checkVotes();
      });

    } catch (error) {
      console.error(error);
    }
  }

  async checkPendingSubpoints(){
        
    if(this.meeting.subpoints[this.subpointGroup].suggestion.pending === true && this.meeting.subpoints[this.subpointGroup].suggestion.votes[this.user.phone] === undefined){
      this.pendingSubpoint = this.meeting.subpoints[this.subpointGroup].suggestion;
    } else {
      this.pendingSubpoint = null;
    }

  }

  async checkActiveSubpoints(){
        
    if(Object.keys(this.meeting.subpoints[this.subpointGroup].location).length !== 0){
      this.activeSubpoint = this.meeting.subpoints[this.subpointGroup].location;

      if(this.activeSubpoint.members[this.user.phone]) {
        this.activeSubpoint.accepted = true;
      } else {
        this.activeSubpoint.accepted = false;
      }

    } else {
      this.activeSubpoint = null;
    }

  }

  async searchAddress(){    
    if(!this.registerForm.value.address.trim().length) {      
      this.addresses = [];
      return;
    }; 

    this.googleMapsPlaces.getPlacePredictions({ input: this.registerForm.value.address }, predictions => {
      this.addresses = predictions;
    });
  }

  async searchSelected(address: string) {
    
    (<HTMLInputElement>document.getElementById('address')).value = address;
    
    this.registerForm.value.address = address;
    
    await this.googleMapsGeocoder.geocode({
      address
    }, (data) => {
      
      this.coords = [data[0].geometry.location.lat(), data[0].geometry.location.lng()];
      
    });
    
    this.addresses = [];
    
    (<HTMLInputElement>document.getElementById('addressesList')).style.display = 'none';
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  async addSubpoint(){

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    if(this.meeting.subpoints[this.subpointGroup].suggestion.pending === true){
      await this.loading.dismiss();
      return await this.presentToast(`Já há um subpoint pendente de aprovação dos integrantes`);
    }

    let data = this.meeting;

    data.subpoints[this.subpointGroup].suggestion = {
      address: this.registerForm.value.address,
      latitude: this.coords[0],
      longitude: this.coords[1],
      pending: true,
      votes: {
        [this.user.phone]: true 
      },
    };

    try {

      await this.meetingService.update(this.meeting.id, data);
      await this.presentToast(`Subpoint sugerido com sucesso.`);
      await this.nav.navigateForward(`/meetings/${this.meeting.id}/chat`);
      
      const promises = this.meeting.subpoints[this.subpointGroup].members.map(member => this.userService.getById(member.phone).get().toPromise().then(response => response.data()));

      Promise.all(promises).then((response) => {
        
        const tokens = response.map((user: any) => {
          return user.receiveNotifications ? user.tokenNotification : null;
        });
        
        const notification: INotification = {
          notification: {
            title: this.meeting.name,
            body: 'Um novo subpoint foi sugerido e aguarda sua aprovação.',
          },
          registration_ids: tokens
        }
    
        this.notificationService.sendNotification(notification);

      });

      // TODO: Refatorar
      
    } catch (error) {
      console.error(error);
      await this.presentToast(`Erro ao sugerir subpoint. Tente novamente mais tarde ...`);
    } finally {
      await this.loading.dismiss();
    }
  }

  async answerSuggestion(response: boolean){
  
    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    try {
      let data = this.meeting;
  
      data.subpoints[this.subpointGroup].suggestion.votes[this.user.phone] = response;
  
      await this.meetingService.update(this.meeting.id, data);

      await this.checkVotes();

    } catch(err) {
      console.error(err);
    } finally {
      await this.loading.dismiss();
    }

  }

  async toogleAnswerSubpointActive(response: boolean){
  
    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    try {

      let data = this.meeting;
  
      data.subpoints[this.subpointGroup].location.members[this.user.phone] = response;
  
      await this.meetingService.update(this.meeting.id, data);

    } catch(err) {
      console.error(err);
    } finally {
      await this.loading.dismiss();
    }

  }

  async checkVotes(){

    console.log(this.meeting.subpoints[this.subpointGroup]);
    

    if(Object.keys(this.meeting.subpoints[this.subpointGroup].suggestion.votes).length !== this.meeting.subpoints[this.subpointGroup].members.length){
      console.log('Votos incompletos');
      return;
    }

    let data = this.meeting;
  
    let accepted = {};
    let rejected = {};
    
    console.log(this.subpointGroup);

    Object.keys(data.subpoints[this.subpointGroup].suggestion.votes).forEach(vote => {
      console.log(vote, data.subpoints[this.subpointGroup].suggestion.votes[vote]);
      if(data.subpoints[this.subpointGroup].suggestion.votes[vote]){
        accepted[vote] = true;
      } else {
        rejected[vote] = true;
      }
    });
    
    let countAccepted = Object.keys(accepted).length;
    let countRejected = Object.keys(rejected).length;

    const usersAccepted = Object.keys(accepted).map(user => {
      return user;
    });

    const usersRejected = Object.keys(rejected).map(user => {
      return user;
    });

    if(countAccepted > countRejected || Object.keys(data.subpoints[this.subpointGroup].location).length === 0) {
      data.subpoints[this.subpointGroup].location = {
        address: data.subpoints[this.subpointGroup].suggestion.address,
        latitude: data.subpoints[this.subpointGroup].suggestion.latitude,
        longitude: data.subpoints[this.subpointGroup].suggestion.longitude,
        members: accepted
      };

      data.subpoints[this.subpointGroup].suggestion = {
        pending: false,
        votes: {}
      };

      await this.meetingService.update(this.meeting.id, data);
      await this.notificationService.buildDataToNotification(this.meeting.name, 'A sugestão foi aceita', [...usersAccepted, ...usersRejected]);
      
    } else if(countAccepted < countRejected || countAccepted === countRejected) {

      data.subpoints[this.subpointGroup].suggestion = {
        pending: false,
        votes: {}
      };

      await this.meetingService.update(this.meeting.id, data);
      await this.notificationService.buildDataToNotification(this.meeting.name, 'A sugestão foi recusada', [...usersAccepted, ...usersRejected]);

    }
    
  }

  async subpointInformation(){

    const alert = await this.alertController.create({
      header: 'Subpoint',
      message: 'Um subpoint é um endereço intermediário onde você pode sugerir para as pessoas que estão próximas à você.',
      backdropDismiss: true,
      buttons: [
        {
          text: 'Entendi',
        }
      ]
    });

    await alert.present();

  }

  async subpointSuggestion(){

    const alert = await this.alertController.create({
      header: 'Subpoint sugerido',
      message: this.pendingSubpoint.address,
      backdropDismiss: true,
      buttons: [
        {
          text: 'Aceitar',
          handler: () => this.answerSuggestion(true)
        },
        {
          text: 'Recusar',
          handler: () => this.answerSuggestion(false)
        },
      ],
    });

    await alert.present();

  }

  async subpointActive(){

    let buttonText = '';
    let response = false;

    if(this.activeSubpoint.members[this.user.phone]) {
      buttonText = 'Prefiro ir sozinho';
      response = false;
    } else {
      buttonText = 'Aceitar';
      response = true;
    }

    const alert = await this.alertController.create({
      header: 'Subpoint ativo',
      message: this.activeSubpoint.address,
      backdropDismiss: true,
      buttons: [
        {
          text: buttonText,
          handler: () => this.toogleAnswerSubpointActive(response)
        },
      ],
    });

    await alert.present();

  }

  async back(){
    await this.nav.back();
  }

}
