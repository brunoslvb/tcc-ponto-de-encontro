import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LoadingController, ModalController, NavController, ToastController } from '@ionic/angular';
import { IUser } from 'src/app/interfaces/User';
import { UserService } from 'src/app/services/user.service';

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
    phone: ""
  };

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
    });
    
  }

  async getUserData(){

    this.loading = await this.loadingController.create({
      spinner: 'crescent'
    });

    await this.loading.present();

    try{
      
      await this.userService.getById(this.id).snapshotChanges().subscribe(async response => {

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

    try{
      
      await this.userService.editUser(this.editForm.value);

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
