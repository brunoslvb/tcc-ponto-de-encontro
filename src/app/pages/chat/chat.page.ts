import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, PopoverController } from '@ionic/angular';
import { PopoverComponent } from 'src/app/components/popover/popover.component';
import { IMeeting } from 'src/app/interfaces/meeting';
import { MeetingService } from 'src/app/services/meeting/meeting.service';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  meeting: IMeeting = {
    id: "",
    name: "",
    location: {
      address: "",
      latitude: 0,
      longitude: 0,
    },
    date: "",
    time: "",
    members: [],
    numberOfMembers: 0,
  };

  popover: any = null;

  constructor(
    private nav: NavController,
    private route: ActivatedRoute,
    private meetingService: MeetingService,
    private userService: UserService,
    private popoverController: PopoverController
  ) { }

  ngOnInit() {
    this.loadDataFromMeeting();
  }

  ionViewWillLeave(){
    this.dismissPopover();
  }

  async loadDataFromMeeting(){
    const id = this.route.snapshot.paramMap.get("id");

    try{
      
      await this.meetingService.getById(id).subscribe(async response => {

        const data: any = response.payload.data(); 
        
        this.meeting = data;
        
        this.meeting.id = response.payload.id;

      });

    } catch(error) {
      console.error(error);
    } 
  }

  async showPopover(ev: any) {

    this.popover = await this.popoverController.create({
      component: PopoverComponent,
      componentProps: {
        meeting: this.meeting
      },
      event: ev,
      translucent: true
    });

    return await this.popover.present();

  }

  dismissPopover(){
    if (this.popover) {
      this.popover.dismiss().then(() => { this.popover = null; });
    }
  }

  async back(){
    await this.nav.back();
  }

}
