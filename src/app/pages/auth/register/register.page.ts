import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDDD } from 'src/app/interfaces/DDD';
import DDD from 'src/app/config/DDD.js';

import firebase from 'firebase';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { IUser } from 'src/app/interfaces/User';
import { StatusBar } from '@ionic-native/status-bar/ngx';

const window = {
  recaptchaVerifier: undefined
};

declare var google;

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  loading: any;

  registerForm: FormGroup;
  ddd: IDDD[] = DDD;

  addresses: Array<{
    description: string;
  }> = [];
  coords: Array<number>;

  private googleMapsPlaces = new google.maps.places.AutocompleteService();
  private googleMapsGeocoder = new google.maps.Geocoder();

  private areaCode: string = "+55";

  constructor(
    private builder: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController,
    private authService: AuthService,
    private loadingController: LoadingController,
    private statusBar: StatusBar
  ) { }

  ngOnInit() {
    this.registerForm = this.builder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      ddd: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern("^[0-9]{9}$")]],
      address: ['', [Validators.required]],
    });
    
    this.recaptchaVerifier();
    
  }
  
  ionViewWillEnter(){
    this.statusBar.backgroundColorByHexString('#F8F8F8');
    this.statusBar.styleDefault();
    this.authService.isUserLoggedIn();
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

  recaptchaVerifier(){
    
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible'
    });
    
  }
  
  async signup(){
    
    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    const phoneNumber = `${this.areaCode}${this.registerForm.value.ddd}${this.registerForm.value.phone}`;
    const appVerifier = window.recaptchaVerifier;

    if((await this.authService.findUserById(phoneNumber)).exists) {
      await this.presentToast("Já existe uma conta com este número");
      await this.loading.dismiss();
      return;
    }

    const user: IUser = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      phone: phoneNumber,
      location: {
        address: this.registerForm.value.address,
        latitude: this.coords[0],
        longitude: this.coords[1]
      },
      groups: {},
      receiveNotifications: true
    }

    try {
      const confirmationResult = await this.authService.signInWithPhoneNumber(phoneNumber, appVerifier)
    
      await this.loading.dismiss();

      const confirmationCode = await this.presentAlertPrompt();
    
      if(confirmationCode === null) return;

      this.loading = await this.loadingController.create({
        spinner: 'crescent'
      });

      await this.loading.present();

      confirmationResult.confirm(confirmationCode).then(async result => {

        await this.authService.saveUserInFirestore(user);

        await this.loading.dismiss();

      }).catch(async err => {
        await this.presentToast('Código de verificação inválido');
      });
    
    } catch (err) {
      
      console.error(err);
      await this.presentToast("Ocorreu um erro no envio do SMS de validação, por favor tente novamente mais tarde")
      this.recaptchaVerifier();

    } finally {
      await this.loading.dismiss();
    }

  }

  async presentAlertPrompt() {

    let response = null;

    const alert = await this.alertController.create({
      header: 'Código de confirmação',
      backdropDismiss: false,
      inputs: [
        {
          name: 'confirmationCode',
          type: 'number',
          attributes: {
            required: true,
            minLength: 6,
            maxLength: 6,
            autoFocus: true,
            about: "Número recebido via SMS"
          },
          placeholder: 'Código de confirmação'
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {            
            alert.dismiss();
          }
        }, {
          text: 'Confirmar',
          role: "ok",
          handler: ({confirmationCode}) => {
            alert.dismiss(confirmationCode);
          }
        }
      ]
    });

    await alert.present();

    await alert.onDidDismiss().then((res) => {

      if(res.role === "cancel") {
        return;
      }
            
      response = res.data.values.confirmationCode;

    });

    return response;

  }

  
  async presentToast(message: string) {
    const toast = await this.toastController.create({
      position: 'bottom',
      message: message,
      duration: 3000
    });
    toast.present();
  }

}
