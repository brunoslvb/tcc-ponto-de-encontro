import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { MeetingService } from 'src/app/services/meeting/meeting.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {

  meeting: any;
  name: string;

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
      this.service.getById(id).subscribe(async response => {

        this.meeting = response.payload.data(); 
  
        this.name = this.meeting.name;

      });


    } catch(error) {
      console.error(error);
    } 
  }

  async back(){
    await this.nav.back();
  }

}
