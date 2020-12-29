import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-create-meeting',
  templateUrl: './create-meeting.page.html',
  styleUrls: ['./create-meeting.page.scss'],
})
export class CreateMeetingPage implements OnInit {

  registerForm: FormGroup;

  constructor(
    private builder: FormBuilder,
    private nav: NavController,
  ) { }

  ngOnInit() {
    this.registerForm = this.builder.group({
      address: ['']
    });
  }

  searchAddress(){
    console.log(this.registerForm.value.address);
  }

  createMeeting(){
    console.log("Create Meeting");
  }

}
