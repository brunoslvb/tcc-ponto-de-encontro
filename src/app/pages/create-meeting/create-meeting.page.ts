import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, NavController, ToastController } from '@ionic/angular';
import { MeetingService } from 'src/app/services/meeting/meeting.service';
import { UserService } from 'src/app/services/user/user.service';

declare var google;

@Component({
  selector: 'app-create-meeting',
  templateUrl: './create-meeting.page.html',
  styleUrls: ['./create-meeting.page.scss'],
})
export class CreateMeetingPage implements OnInit {

  registerForm: FormGroup;
  addresses: Array<{
    description: string;
  }> = [];
  coords: Array<Number>;

  loading: any;

  private googleMapsPlaces = new google.maps.places.AutocompleteService();
  private googleMapsGeocoder = new google.maps.Geocoder();

  constructor(
    private builder: FormBuilder,
    private nav: NavController,
    private meetingService: MeetingService,
    private userService: UserService,
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

    if(!this.registerForm.value.address.trim().length) return; 

    console.log("Função searchAddress()");

    this.googleMapsPlaces.getPlacePredictions({ input: this.registerForm.value.address }, predictions => {
      this.addresses = predictions;
    });
  }

  async searchSelected(address: string) {
    
    (<HTMLInputElement>document.getElementById('address')).value = address;

    this.registerForm.value.address = address;

    this.addresses = [];

    await this.googleMapsGeocoder.geocode({
      address
    }, (data) => {
      
      this.coords = [data[0].geometry.location.lat(), data[0].geometry.location.lng()];
    
    });
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
      sessionStorage.getItem('user')
    ];

    const data = {
      owner: sessionStorage.getItem('user'),
      name: this.registerForm.value.name,
      date: this.registerForm.value.date,
      time: this.registerForm.value.time,
      location: {
        address: this.registerForm.value.address,
        latitude: this.coords[0],
        longitude: this.coords[1]
      },
      members,
      numberOfMembers: members.length
    }

    try {
      const { id } = await this.meetingService.createMeeting(data);

      await data.members.forEach(async member => {
        await this.userService.addMeetingToUser(member, id);
      });

      await this.loading.dismiss();
      await this.presentToast(`Encontro ${data.name} criado com sucesso.`);
      await this.nav.back();
      
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
