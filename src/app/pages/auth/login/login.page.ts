import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDDD } from 'src/app/interfaces/DDD.js';
import DDD from '../../../config/DDD.js';

import firebase from 'firebase/app';

import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

const window = {
  recaptchaVerifier: undefined
};

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})

export class LoginPage implements OnInit {

  loading: any;

  loginForm: FormGroup;
  ddd: IDDD[] = DDD;

  private areaCode: string = "+55";

  constructor(
    private builder: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController,
    private authService: AuthService,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.loginForm = this.builder.group({
      ddd: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern("^[0-9]{9}$")]],
    });

    this.recaptchaVerifier();
  }
  
  ionViewWillEnter(){
    this.authService.isUserLoggedIn();
  }

  recaptchaVerifier(){
    
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible'
    });
    
  }
  
  async signin(){
    
    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    const phoneNumber = `${this.areaCode}${this.loginForm.value.ddd}${this.loginForm.value.phone}`;
    const appVerifier = window.recaptchaVerifier;

    if(!(await this.authService.findUserById(phoneNumber)).exists) {
      await this.presentToast("Conta não encontrada");
      await this.loading.dismiss();
      return;
    }

    try {
      const confirmationResult = await this.authService.signInWithPhoneNumber(phoneNumber, appVerifier)
    
      await this.loading.dismiss();

      const confirmationCode = await this.presentAlertPrompt();
    
      this.loading = await this.loadingController.create({
        spinner: 'crescent'
      });
  
      await this.loading.present();

      if(confirmationCode === null) return;

      confirmationResult.confirm(confirmationCode).then(async result => {

        await this.presentToast('Login realizado com sucesso');

      }).catch(async err => {
        await this.presentToast('Código de verificação inválido');
      });
    
    } catch (err) {
      console.error(err);
      this.recaptchaVerifier();
    } finally {
      await this.loading.dismiss();
    }

  }

  async confirmCode(confirmationResult){

    const confirmationCode = await this.presentAlertPrompt();
    
    if(confirmationCode === null) return;
  
    confirmationResult.confirm(confirmationCode).then(result => {

      console.log(result);

    }).catch(async err => {
      await this.presentToast('Código de verificação inválido');
    });

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
