import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from './card/card.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { CustomInputComponent } from './custom-input/custom-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FooterComponent } from './footer/footer.component';
import { BrowserModule } from '@angular/platform-browser';
import { PopoverComponent } from './popover/popover.component';

@NgModule({
  declarations: [
    CardComponent,
    CustomInputComponent,
    PopoverComponent, 
    FooterComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    ReactiveFormsModule
  ],
  exports: [
    CardComponent,
    CustomInputComponent,
    PopoverComponent,
    FooterComponent
  ]
})
export class ComponentModule { }