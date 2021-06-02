import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { INotification } from '../interfaces/Notification';
import { AxiosService } from './axios.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  currentMessage = new BehaviorSubject(null);

  constructor(
    private angularFireMessaging: AngularFireMessaging,
    private userService: UserService,
    private axiosService: AxiosService
  ) {
    this.angularFireMessaging.messages.subscribe((_messaging: any) => {
      _messaging.onMessage = _messaging.onMessage.bind(_messaging);
      _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
    })
  }

  requestPermission() {
    this.angularFireMessaging.requestToken.subscribe(async (token) => {
      console.log(token);
      await this.userService.update({tokenNotification: token});
    }, (err) => {
      console.error('Unable to get permission to notify.', err);
    });
  }

  receiveMessage() {
    this.angularFireMessaging.messages.subscribe((payload) => {
      console.log("new message received. ", payload);
      this.currentMessage.next(payload);
    });
  }

  sendNotification(data: INotification){    

    return this.axiosService.post(data);

  }

}
