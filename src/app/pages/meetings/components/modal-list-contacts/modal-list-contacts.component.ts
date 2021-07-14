import { Component, OnInit } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { IUser } from 'src/app/interfaces/User';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-modal-list-contacts',
  templateUrl: './modal-list-contacts.component.html',
  styleUrls: ['./modal-list-contacts.component.scss'],
})
export class ModalListContactsComponent implements OnInit {

  user: IUser;
  contacts: Array<IUser> = [];
  loading: any;

  selectedContacts: IUser[] = [];

  constructor(
    private userService: UserService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private toastController: ToastController,
    private alertController: AlertController,
    private statusBar: StatusBar
  ) { }

  ngOnInit() {

    // this.statusBar.backgroundColorByHexString('#F8F8F8');
    // this.statusBar.styleDefault();

    this.loadContacts();
  }


  async loadContacts(){
    
    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    try {
      const ids = [];

      await this.userService.getContacts().get().toPromise().then(response => {
        response.docs.forEach(async doc => ids.push(doc.id));      
      });

      const promises = ids.map(id => this.userService.getById(id).get().toPromise().then(response => response.data()));

      await Promise.all(promises).then(async (response) => {
        this.contacts = response.map((user: any) => user);
      });

    } catch (error) {
      this.presentToast('Problemas ao carregar contatos. Tente novamente mais tarde.')
    } finally {
      await this.loading.dismiss();      
    }

  }

  async alertDeleteContact(contact: IUser) {
    const alert = await this.alertController.create({
      header: `Remover`,
      message: `Deseja remover ${contact.name} ?`,
      backdropDismiss: false,
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
          handler: () => {
            this.deleteContact(contact.phone);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteContact(contact: string){
    
    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    try {
      await this.userService.deleteContact(contact);

      let aux = this.contacts.findIndex((item: IUser) => item.phone === contact);

      if(aux != -1){
        this.contacts.splice(aux, 1);
      }

    } catch (err) {
      console.error(err);
    } finally {
      await this.loading.dismiss();
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      position: 'bottom',
      message: message,
      duration: 3000
    });
    toast.present();
  }

  async closeModal(){
    await this.modalController.dismiss();
  }

  async submitModal(){
    await this.modalController.dismiss(this.selectedContacts);
  }

}
