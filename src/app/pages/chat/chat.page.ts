import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { MeetingsService } from 'src/app/services/meetings/meetings.service';

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
    private service: MeetingsService,
  ) { }

  ngOnInit() {
    this.loadDataFromMeeting();
  }

  async loadDataFromMeeting(){
    const id = this.route.snapshot.paramMap.get("id");

    try{
      const response = await this.service.getById(id);

      await response.forEach(doc => {
        this.meeting = doc.data(); 
      });

      this.name = this.meeting.name;

    } catch(error) {
      console.error(error);
    } 
  }

  async back(){
    await this.nav.back();
  }

}
