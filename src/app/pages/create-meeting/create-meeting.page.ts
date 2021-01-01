import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { MeetingService } from 'src/app/services/meeting/meeting.service';
import { UserService } from 'src/app/services/user/user.service';

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
    private meetingService: MeetingService,
    private userService: UserService
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

    const data = {
      owner: sessionStorage.getItem('user'),
      name: this.registerForm.value.name,
      date: this.registerForm.value.date,
      time: this.registerForm.value.time,
      location: {
        address: this.registerForm.value.address,
        latitude: -9991021300,
        longitude: -1123439974
      },
      members: [
        sessionStorage.getItem('user'),
        sessionStorage.getItem('userAux'),
      ],
      numberOfmembers: 2
    }

    try {
      const { id } = await this.meetingService.createMeeting(data);

      console.info("Meeting created:", id);

      await data.members.forEach(async member => {
        await this.userService.addGroupToUser(member, id);
      });

    } catch (error) {
      console.error(error);
    }
  }

  async back(){
    await this.nav.back();
  }

}
