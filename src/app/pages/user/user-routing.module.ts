import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentModule } from 'src/app/components/component.module';
import { ProfilePage } from './profile/profile.page';

const routes: Routes = [
  { path: '',
    children: [
      { path: ':id', component: ProfilePage },
    ]
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    IonicModule,
    FormsModule,
    ComponentModule,
    ReactiveFormsModule
  ],
  declarations: [
    ProfilePage
  ],
})
export class UserRoutingModule {}
