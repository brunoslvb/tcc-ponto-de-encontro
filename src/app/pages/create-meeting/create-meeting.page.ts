import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';

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
    private service: MeetingsService
  ) { }

  ngOnInit() {
    this.registerForm = this.builder.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
    });
  }

  searchAddress(){
    console.log(this.registerForm.value.address);
  }

  async createMeeting(){
    console.log("Create Meeting: ", this.registerForm.value);

    try {
      await this.service.createMeeting("teste", this.registerForm.value);
      console.info("Meeting created");
    } catch (error) {
      console.error(error);
    }
  
  
  }

}
