import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentModule } from 'src/app/components/component.module';
import { HomePage } from '../home/home.page';
import { LoginPage } from './login/login.page';
import { RegisterPage } from './register/register.page';

const routes: Routes = [
  { path: '',
    children: [
      { path: '', component: HomePage },
      { path: 'login', component: LoginPage },
      { path: 'register', component: RegisterPage },
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentModule
  ],
  declarations: [
    HomePage,
    LoginPage,
    RegisterPage
  ],
})
export class AuthRoutingModule {}
