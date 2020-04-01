import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App } from 'ionic-angular';
import {QueryProvider} from "../../providers/query/query";
import {AuthProvider} from "../../providers/auth/auth";
import {PrivateChatPage} from "../private-chat/private-chat";
import { Observable } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-inbox',
  templateUrl: 'inbox.html',
})
export class InboxPage {

  authUser: any;
  chats: Array<any> = [];
  chats$: Observable<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public queryProvider: QueryProvider,
    public authProvider: AuthProvider,
    public appCtrl: App
  ) {
    this.authUser = this.authProvider.getUser();
    if (this.authUser) {
      this.getChats(this.authUser.key);
    }
  }

  getChats(chatKey) {
    this.queryProvider.getChats(chatKey).subscribe(chats => {
      let c: any[] = chats;
      this.chats = c.reverse();
      this.chats$ = Observable.of(this.chats);
      console.log(this.chats)
    });
  }

  gotToPrivateChat(member: any, chat: any) {
    this.markRead(chat);
    this.appCtrl.getRootNav().push(PrivateChatPage, {
      member: member,
      chat: chat
    });
  }

  async markRead(chat) {
    if (chat) {
      await this.queryProvider.markChatAsRead(chat.key);
    }
  }

}
