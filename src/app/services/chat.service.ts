import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private collection: string = 'meetings';

  constructor(
    private firestore: AngularFirestore
  ) { }

  getMessages(chatId: string){
    return this.firestore.collection(`meetings/${chatId}/chat`, ref => ref.orderBy('createdAt')).snapshotChanges();
  }

  saveMessage(chatId: string, data){
    return this.firestore.collection(`meetings/${chatId}/chat`).add(data);
  }

}
