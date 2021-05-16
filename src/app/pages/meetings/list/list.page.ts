import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { IMeeting } from 'src/app/interfaces/Meeting';
import { IUser } from 'src/app/interfaces/User';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';
import { ModalListContactsComponent } from '../components/modal-list-contacts/modal-list-contacts.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {

  loading: any;
  
  meetings: Array<IMeeting> = [];

  user: IUser = JSON.parse(atob(sessionStorage.getItem('user')));

  constructor(
    private meetingService: MeetingService,
    private userService: UserService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private nav: NavController,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.getMeetingsFromUser();
  }

  async getMeetingsFromUser(){
    
    this.userService.getById(this.user.phone).snapshotChanges().subscribe((user: any) => {      

      this.user = user.payload.data();

      let meetingsAux = [];
      
      user.payload.data().groups.forEach(group => {

        this.meetingService.getById(group).subscribe(doc => {

          let data: any = doc.payload.data();

          data.id = doc.payload.id;

          let aux = meetingsAux.findIndex(meeting => meeting.id === data.id);

          if(aux != -1){
            meetingsAux[aux] = data;
          } else {
            meetingsAux.push(data);
          }

        });

      });

      this.meetings = meetingsAux;

    });

  }

  async alertAddContact() {        

    const alert = await this.alertController.create({
      header: 'Adicione um amigo',
      backdropDismiss: false,
      inputs: [
        {
          name: 'phone',
          type: 'text',          
          placeholder: 'Ex.: +5511912345678'
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
          handler: ({phone}) => {
            this.addContact(phone);
          }
        }
      ]
    });

    await alert.present();

  }

  async addContact(phone: string){

    if(phone === null || phone === "") return;

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    const contact: any = await this.userService.getById(phone).get().toPromise();    

    if(!contact.exists) {
      await this.loading.dismiss();
      return await this.presentToast("Número de telefone não encontrado");
    }

    if((await this.userService.getContactByIdInUser(phone)).exists) {
      await this.loading.dismiss();
      return await this.presentToast("Contato já está adicionado");
    }

    const data: IUser = {
      name: contact.data().name,
      phone: contact.data().phone,
    }

    await this.userService.addContact(data);

    await this.loading.dismiss();

    await this.presentToast("Contato adicionado com sucesso");

  }

  async alertNotification(){

    const alert = await this.alertController.create({
      header: `${ this.user.receiveNotifications ? "Desativar" : "Ativar"} notificações`,
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
            this.toggleNotifications();
          }
        }
      ]
    });

    await alert.present();

  }

  async toggleNotifications() {
    const data: IUser = this.user;

    const msg: string = `Notificações ${ this.user.receiveNotifications ? "desativadas" : "ativadas"} com sucesso`;

    data.receiveNotifications = !data.receiveNotifications;

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    try{
      
      await this.userService.update(data);

      await this.presentToast(msg);

    } catch(error) {
      console.error(error);
      await this.presentToast("Problemas ao atualizar informações. Tente novamente mais tarder");
    } finally {
      await this.loading.dismiss();
    }
  }

  async showContacts(){
    const modal = await this.modalController.create({
      component: ModalListContactsComponent,
      componentProps: {
        user: this.user
      }
    });
    await modal.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      position: 'bottom',
      message: message,
      duration: 3000
    });
    toast.present();
  }

  async profile() {
    await this.nav.navigateForward(`/user/${btoa(this.user.phone)}`);
  }

}
