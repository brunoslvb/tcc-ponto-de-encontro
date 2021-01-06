import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { IMeeting } from 'src/app/interfaces/meeting';
import { MeetingService } from 'src/app/services/meeting/meeting.service';

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

  constructor(
    private nav: NavController,
    private route: ActivatedRoute,
    private service: MeetingService,
  ) { }

  ngOnInit() {
    this.loadDataFromMeeting();
  }

  async loadDataFromMeeting(){
    const id = this.route.snapshot.paramMap.get("id");

    try{
      
      await this.service.getById(id).subscribe(async response => {

        const data: any = response.payload.data(); 
  
        this.meeting = {
          id: response.payload.id,
          name: data.name,
          location: {
            address: data.location.address,
            latitude: data.location.latitude,
            longitude: data.location.longitude,
          },
          date: data.date,
          time: data.time,
          members: data.members,
          numberOfMembers: data.numberOfMembers,
        }        

      });


    } catch(error) {
      console.error(error);
    } 
  }

  async back(){
    await this.nav.back();
  }

}
