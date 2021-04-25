import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDDD } from 'src/app/interfaces/DDD.js';
import DDD from '../../../config/DDD.js';

import firebase from 'firebase/app';

import { AlertController, ToastController } from '@ionic/angular';

const window = {
  recaptchaVerifier: undefined
};

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  loginForm: FormGroup;
  ddd: IDDD[] = DDD;

  private areaCode: string = "+55";

  constructor(
    private builder: FormBuilder,
    private alertController: AlertController,
    private toast: ToastController
  ) { }

  ngOnInit() {
    this.loginForm = this.builder.group({
      ddd: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern("^[0-9]{9}$")]],
    });

    this.recaptchaVerifier();
  }
  
  recaptchaVerifier(){
    
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible'
    });
    
  }
  
  async signin(){
    
    const phoneNumber = `${this.areaCode}${this.loginForm.value.ddd}${this.loginForm.value.phone}`;
    const appVerifier = window.recaptchaVerifier;

    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier).then(confirmationResult => {
            
      this.confirmCode(confirmationResult);
    
    }).catch(err => {
      console.error(err);
      this.recaptchaVerifier();
    });

  }

  async confirmCode(confirmationResult){

    const confirmationCode = await this.presentAlertPrompt();
    
    if(confirmationCode === null) return;
  
    confirmationResult.confirm(confirmationCode).then(result => {

      console.log(result);

    }).catch(async err => {
      await this.presentToastWithOptions();
    });

  }

  async presentAlertPrompt() {

    let response = null;

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
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

  
  async presentToastWithOptions() {
    const toast = await this.toast.create({
      header: 'Código incorreto',
      message: 'Click to Close',
      position: 'bottom',
      buttons: [
        {
          side: 'start',
          icon: 'star',
          text: 'Favorite',
          handler: () => {
            console.log('Favorite clicked');
          }
        }, {
          text: 'Done',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    await toast.present();

    const { role } = await toast.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

}
