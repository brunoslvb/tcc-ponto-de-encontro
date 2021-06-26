import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Environment, GoogleMap, GoogleMapOptions, GoogleMaps, GoogleMapsEvent } from '@ionic-native/google-maps';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavController, LoadingController, Platform, ToastController, AlertController } from '@ionic/angular';
import firebase from 'firebase';
import { IMeeting } from 'src/app/interfaces/Meeting';
import { IUser } from 'src/app/interfaces/User';
import { ChatService } from 'src/app/services/chat.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';

declare var google;

@Component({
  selector: 'app-subpoint',
  templateUrl: './subpoint.page.html',
  styleUrls: ['./subpoint.page.scss'],
})

export class SubpointPage implements OnInit {

  loading: any;

  registerForm: FormGroup;
  addresses: Array<{
    description: string;
  }> = [];
  coords: Array<Number>;

  user: IUser = JSON.parse(atob(sessionStorage.getItem('user')));
  meeting: IMeeting;
  subpointGroup: any;

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
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.registerForm = this.builder.group({
      address: ['', Validators.required],
    });
    this.loadMeeting();
  }
  
  async loadMeeting() {
    
    const id = this.route.snapshot.paramMap.get("id");
    
    try {
      
      await this.meetingService.getById(id).snapshotChanges().subscribe(async response => {
        
        const data: any = response.payload.data();
        
        this.meeting = data;
        
        this.meeting.id = response.payload.id;
        
        this.subpointGroup = await this.meetingService.getSubpointGroup(this.meeting.id);        

        this.checkPendingSubpoints();

      });

    } catch (error) {
      console.error(error);
    }
  }

  async checkPendingSubpoints(){
    
    (<HTMLInputElement>document.getElementById('subpoints')).style.display = 'block';

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

    // await this.loading.present();

    const data = {
      subpoints: {
        [this.subpointGroup]: {
          suggestion: {
            address: this.registerForm.value.address,
            latitude: this.coords[0],
            longitude: this.coords[1],
            pending: true
          },
        }
      }
    }    
    
    if(this.meeting.subpoints[this.subpointGroup].suggestion.pending){
      return await this.presentToast(`Já há um subpoint pendente de aprovação dos integrantes`);
    }

    try {

      await this.meetingService.update(this.meeting.id, data);

      await this.presentToast(`Subpoint sugerido com sucesso.`);
      await this.nav.navigateForward(`/meetings/${this.meeting.id}/chat`);
      
    } catch (error) {
      console.error(error);
      await this.presentToast(`Erro ao sugerir subpoint. Tente novamente mais tarde ...`);
    } finally {
      await this.loading.dismiss();
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

  async back(){
    await this.nav.back();
  }

}
