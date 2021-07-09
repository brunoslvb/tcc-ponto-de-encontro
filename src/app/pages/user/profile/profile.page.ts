import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { IUser } from 'src/app/interfaces/User';
import { UserService } from 'src/app/services/user.service';

declare var google;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  loading: any;

  editForm: FormGroup;

  user: IUser = {
    name: "",
    email: "",
    phone: "",
    location: {
      address: ""
    }
  };

  addresses: Array<{
    description: string;
  }> = [];
  coords: Array<Number> = [];

  listener: Subscription;

  private googleMapsPlaces = new google.maps.places.AutocompleteService();
  private googleMapsGeocoder = new google.maps.Geocoder();

  id: string = atob(this.route.snapshot.paramMap.get("id"));

  constructor(
    private builder: FormBuilder,
    private nav: NavController,
    private route: ActivatedRoute,
    private userService: UserService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController
  ) { }

  ngOnInit() {

    this.getUserData();

    this.editForm = this.builder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      address: ['', [Validators.required]],
    });
    
  }

  ionViewWillLeave(){
    this.listener.unsubscribe();
  }

  async searchAddress(){    
    if(this.editForm.value.address.trim().length === 0) {      
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

  async getUserData(){

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    try{
      
      this.listener = await this.userService.getById(this.id).snapshotChanges().subscribe(async response => {

        const data: any = response.payload.data(); 
        
        this.user = data;
        
      });

    } catch(error) {
      console.error(error);
    } finally {
      await this.loading.dismiss();
    }
  }

  async update(){

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    const data: any = {
      name: this.editForm.value.name,
      email: this.editForm.value.email,
      phone: this.editForm.value.phone,
    }

    if(this.coords.length > 0){
      data.location = {
        address: this.editForm.value.address,
        latitude: this.coords[0],
        longitude: this.coords[1]
      }
    }

    try{
      
      await this.userService.update({...this.user, ...data});

      await this.presentToast("Informações atualizadas com sucesso");

    } catch(error) {
      console.error(error);
      await this.presentToast("Problemas ao atualizar informações. Tente novamente mais tarder");
    } finally {
      await this.loading.dismiss();
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  async back(){
    await this.nav.back();
  }

}
