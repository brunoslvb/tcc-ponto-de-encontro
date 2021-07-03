import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { IUser } from 'src/app/interfaces/User';
import { ChatService } from 'src/app/services/chat.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';

import firebase from 'firebase/app';

declare var google;

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
})
export class CreatePage implements OnInit {
  
  loading: any;

  registerForm: FormGroup;
  addresses: Array<{
    description: string;
  }> = [];
  coords: Array<Number>;

  user: IUser = JSON.parse(atob(sessionStorage.getItem('user')));

  private googleMapsPlaces = new google.maps.places.AutocompleteService();
  private googleMapsGeocoder = new google.maps.Geocoder();

  constructor(
    private builder: FormBuilder,
    private nav: NavController,
    private meetingService: MeetingService,
    private userService: UserService,
    private chatService: ChatService,
    private loadingController: LoadingController,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.registerForm = this.builder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
    });
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

  async createMeeting(){

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();
    
    const members: Array<string> = [
      this.user.phone
    ];

    const data = {
      owner: this.user.phone,
      name: this.registerForm.value.name,
      date: this.registerForm.value.date,
      time: this.registerForm.value.time,
      location: {
        address: this.registerForm.value.address,
        latitude: this.coords[0],
        longitude: this.coords[1]
      },
      subpoints: {
        group1: {
          location: {},
          suggestion: {},
          members: []
        },
        group2: {
          location: {},
          suggestion: {},
          members: []
        },
        group3: {
          location: {},
          suggestion: {},
          members: []
        },
        group4: {
          location: {},
          suggestion: {},
          members: []
        },
      },
      members,
      numberOfMembers: members.length
    }

    try {
      const { id } = await this.meetingService.createMeeting(data);

      await data.members.forEach(async member => {
        await this.userService.addMeetingToUser(member, id);
      });

      await this.chatService.saveMessage(id, {
        message: `Encontro ${data.name} criado`,
        type: "event",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      await this.loading.dismiss();
      await this.presentToast(`Encontro ${data.name} criado com sucesso.`);
      await this.nav.navigateForward(`/meetings/${id}/map`, {
        replaceUrl: true
      });
      
    } catch (error) {
      console.error(error);
      await this.presentToast(`Erro ao criar o encontro. Tente novamente mais tarde ...`);
      await this.loading.dismiss();
    }
  }

  async back(){
    await this.nav.back();
  }

}
