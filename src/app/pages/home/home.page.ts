import { Component } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private authService: AuthService,
    private statusBar: StatusBar
  ) { }

  ionViewWillEnter(){

    this.statusBar.backgroundColorByHexString('#F8F8F8');
    this.statusBar.styleDefault();

    this.authService.isUserLoggedIn();
  }

}
