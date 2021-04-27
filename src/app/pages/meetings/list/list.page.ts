import { Component, OnInit } from '@angular/core';
import { AlertController, LoadingController, MenuController, ModalController, NavController, ToastController } from '@ionic/angular';
import { ModalMapComponent } from 'src/app/components/modal-map/modal-map.component';
import { IMeeting } from 'src/app/interfaces/Meeting';
import { IUser } from 'src/app/interfaces/User';
import { MeetingService } from 'src/app/services/meeting.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {

  meetings: Array<IMeeting> = [];

  loading: any;

  user: IUser = JSON.parse(sessionStorage.getItem('user'));

  constructor(
    private meetingService: MeetingService,
    private userService: UserService,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private nav: NavController,
    private menu: MenuController,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {    
    this.getMeetingsOfUser();
  }

  async showModalMap(meeting: IMeeting){
    const modal = await this.modalController.create({
      component: ModalMapComponent,
      componentProps: {
        meeting
      }
    });

    await modal.present();
  }

  async getMeetingsOfUser(){
    
    this.userService.getById(this.user.phone).subscribe((user: any) => {      

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

  async addContact(){
    const phone = await this.presentAlertPrompt();

    if(phone === null || phone === "") return;

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    const contact: any = await this.userService.getContactById(phone);

    console.log(contact);
    

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

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      position: 'bottom',
      message: message,
      duration: 3000
    });
    toast.present();
  }

  async presentAlertPrompt() {

    let response = null;

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
            alert.dismiss(phone);
          }
        }
      ]
    });

    await alert.present();

    await alert.onDidDismiss().then((res) => {

      if(res.role === "cancel") {
        return;
      }
      
      console.log(res);

      response = res.data.values.phone;

    });

    return response;

  }

}
