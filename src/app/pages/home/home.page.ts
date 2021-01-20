import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor() {
    sessionStorage.setItem("user", "brunosilva2365@gmail.com");
    sessionStorage.setItem("userAux", "barbara@gmail.com");
  }

}
