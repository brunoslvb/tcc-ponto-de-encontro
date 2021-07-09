import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { IUser } from 'src/app/interfaces/User';
import { ChatService } from 'src/app/services/chat.service';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';
import firebase from 'firebase';
import { IMeeting } from 'src/app/interfaces/Meeting';
import { ActivatedRoute } from '@angular/router';

declare var google;

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
})
export class EditPage implements OnInit {

  loading: any;

  meeting: IMeeting = {
    name: '',
    location: {
      address: ''
    },
    date: '',
    time: ''
  };
  editForm: FormGroup;
  addresses: Array<{
    description: string;
  }> = [];
  coords: Array<Number> = [];

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
    private toastController: ToastController,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.loadMeeting();
    this.editForm = this.builder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
    });
  }

  async loadMeeting(){
    const id = this.route.snapshot.paramMap.get("id");

    try{
      
      await this.meetingService.getById(id).get().toPromise().then(async response => {
        
        const data: any = response.data(); 
        
        this.meeting = data;
        
        this.meeting.id = response.id;
        
      });

    } catch(error) {
      console.error(error);
    } 

  }

  async searchAddress(){    
    if(!this.editForm.value.address.trim().length) {      
      this.addresses = [];
      return;
    }; 

    this.googleMapsPlaces.getPlacePredictions({ input: this.editForm.value.address }, predictions => {
      this.addresses = predictions;
    });
  }

  async searchSelected(address: string) {
    
    (<HTMLInputElement>document.getElementById('address')).value = address;
    
    this.editForm.value.address = address;
    
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

  async editMeeting(){

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    const data: any = {
      name: this.editForm.value.name,
      date: this.editForm.value.date,
      time: this.editForm.value.time,
    }

    if(this.coords.length > 0){
      data.location = {
        address: this.editForm.value.address,
        latitude: this.coords[0],
        longitude: this.coords[1]
      }
    }

    try {

      await this.meetingService.update(this.meeting.id, {...this.meeting, ...data});

      await this.chatService.saveMessage(this.meeting.id, {
        message: `Encontro ${data.name} atualizado`,
        type: "event",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      await this.loading.dismiss();
      await this.presentToast(`Encontro ${data.name} atualizado com sucesso.`);
      await this.nav.navigateForward(`/meetings/${this.meeting.id}/chat`, {
        replaceUrl: true
      });
      
    } catch (error) {
      console.error(error);
      await this.presentToast(`Erro ao atualizar o encontro. Tente novamente mais tarde ...`);
      await this.loading.dismiss();
    }
  }

  async back(){
    await this.nav.back();
  }

}
