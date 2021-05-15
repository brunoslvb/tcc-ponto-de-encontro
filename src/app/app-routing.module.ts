import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import ('./pages/home/home.module').then( m => m.HomePageModule) },
  { path: 'meetings', loadChildren: './pages/meetings/meetings.module#MeetingsModule' }, 
  { path: 'auth', loadChildren: './pages/auth/auth.module#AuthModule' }, 
  { path: 'user', loadChildren: './pages/user/user.module#UserModule' }, 
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
