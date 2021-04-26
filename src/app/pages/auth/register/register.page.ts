import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDDD } from 'src/app/interfaces/DDD';
import DDD from 'src/app/config/DDD.js';

import firebase from 'firebase';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { IUser } from 'src/app/interfaces/User';

const window = {
  recaptchaVerifier: undefined
};

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  loading: any;

  registerForm: FormGroup;
  ddd: IDDD[] = DDD;

  private areaCode: string = "+55";

  constructor(
    private builder: FormBuilder,
    private alertController: AlertController,
    private toastController: ToastController,
    private authService: AuthService,
    private loadingController: LoadingController,
  ) { }

  ngOnInit() {
    this.registerForm = this.builder.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      ddd: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern("^[0-9]{9}$")]],
    });

    this.recaptchaVerifier();

  }
  
  ionViewWillEnter(){
    this.authService.isUserLoggedIn();
  }

  register(){
    console.log(this.registerForm.value);
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
      groups: []
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
