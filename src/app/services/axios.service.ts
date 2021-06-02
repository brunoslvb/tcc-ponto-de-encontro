import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class AxiosService {

  constructor() { }

  private request(method, data){

    const headers = {
      Authorization: "key=AAAAn7Q-Rdc:APA91bGuJ_TxONg1BF4Xvzow1DPaehRHHO5u48CCNpj8f7ISYkbG1vWzPdVuomJZbML7fWN8Qz1I6L9EirgF1FofURxxlIiqwBVkC2vsSaGywlVlx5PmwMUFwLR0_rPZl4fl1mwYPkIF"
    }
    
    console.log(data);

    return axios.request({
      url: 'https://fcm.googleapis.com/fcm/send',
      headers,
      method,
      data
    });

  }

  post(data){
    return this.request("POST", data);
  }

}
