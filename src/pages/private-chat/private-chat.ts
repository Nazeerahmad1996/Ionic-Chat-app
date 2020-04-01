import { Component, ViewChild } from '@angular/core';
import {IonicPage, NavController, NavParams, Content, LoadingController} from 'ionic-angular';
import {Message} from "../../models/message";
import {Observable} from "rxjs/Rx";
import {AngularFireDatabase, AngularFireList} from "@angular/fire/database";
import {AuthProvider} from "../../providers/auth/auth";
import {QueryProvider} from "../../providers/query/query";
import {DatetimeProvider} from "../../providers/datetime/datetime";
import "rxjs-compat/add/operator/take";

@IonicPage()
@Component({
  selector: 'page-private-chat',
  templateUrl: 'private-chat.html',
})
export class PrivateChatPage {

  initChat: boolean = false;
  receiver: any;
  newMessage: Message;
  messages: Observable<any>;
  chatRef: AngularFireList<any>;
  chatRefReceiver: AngularFireList<any>;
  authUser: any;
  currentChat: any;
  chats: any;
  inboxChat: any;
  @ViewChild(Content) content: Content;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public authProvider: AuthProvider,
    public db: AngularFireDatabase,
    public queryProvider: QueryProvider,
    public loadingCtrl: LoadingController,
    public datetimeProvider: DatetimeProvider
  ) {
    this.presentLoading();
    this.authUser = this.authProvider.getUser();
    this.newMessage = new Message();
    this.receiver = this.navParams.get('member');
    this.chatInit();
    setTimeout(() => {
      this.inboxChat = this.navParams.get('chat');
      this.markRead(this.inboxChat);
      this.getChatMessages();
      this.scrollToBottom();
    }, 2000);
  }

  ionViewDidLoad(){
    this.scrollToBottom();
  }
  ionViewDidEnter() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom();
    }
  }

  getChatMessages() {
    let chat;
    if (this.initChat === true) {
      this.queryProvider.getChats(this.authUser.key)
        .take(1)
        .subscribe(chats => {
          chat = this.chatExist(chats);
          this.currentChat = chat;
          this.messages = this.queryProvider.getPrivateMessages(chat.ID, 20);
          this.initChat = false;
        });
    } else {
      chat = this.chatExist(this.chats);
      this.messages = this.queryProvider.getPrivateMessages(chat.ID, 20);
      this.messages.subscribe(() => {
        this.scrollToBottom();
      })
    }
  }

  sendMessage() {
    this.newMessage.timestamp =this.formatTime(Date.now());
    this.updateChat(this.currentChat.key);
    this.createMessage(this.currentChat.ID);
    setTimeout(() => {
      this.scrollToBottom();
    }, 2000)
  }

  chatInit() {
    const chatInit$ = this.queryProvider.getChats(this.authUser.key);
    chatInit$
      .take(1)
      .subscribe( chats => {
        this.chats = chats;
        const existChat = this.chatExist(chats)
        if (chats.length !== 0) {
          if( ! existChat) {
            this.createChat();
            this.initChat = true;
          } else {
            this.currentChat = existChat;
            console.log(this.currentChat);
          }
        } else {
          this.createChat();
          this.initChat = true;
        }
      })
  }

  chatExist(chats) {
    return chats.find( chat => {
      return chat.ID === `${this.authUser.key}-${this.receiver.key}` ||  chat.ID === `${this.receiver.key}-${this.authUser.key}`;
    })
  }

  createChat() {
    this.chatRef = this.db.list(`/private-chats/${this.authUser.key}`);
    this.chatRef.push({
      ID: `${this.authUser.key}-${this.receiver.key}`,
      receiver: this.receiver,
      lastMessage: this.newMessage,
      read: 'true'
    });
    this.chatRefReceiver = this.db.list(`/private-chats/${this.receiver.key}`);
    this.chatRefReceiver.push({
      ID: `${this.authUser.key}-${this.receiver.key}`,
      receiver: this.authUser,
      lastMessage: this.newMessage,
      read:'true'
    });
  }

  async updateChat(key: string) {
    if (this.currentChat && this.receiver) {
      let recChats: any[] = await this.queryProvider.getReceiverChats(this.receiver.key);
      let found = this.findChat(recChats);
      if (found) {
      let ref = this.db.list(`/private-chats/${this.receiver.key}`);

        ref.update(found.key, {
          read: 'false'
        })

      }
    }
  }

  findChat(chats): any {
    return chats.find( chat => {
      return chat.ID == this.currentChat.ID;
    })
  }

  createMessage(chatKey: string) {
    this.chatRef = this.db.list(`/chat-messages/${chatKey}`);
    this.chatRef.push({
      sender: this.authUser,
      message: this.newMessage
    })
    this.scrollToBottom();
    this.newMessage.text = '';
  }

  presentLoading() {
    const loader = this.loadingCtrl.create({
      content: "Please wait...",
      duration: 2000
    });
    loader.present();
  }

  formatTime(time) {
    return this.datetimeProvider.formatAMPM(time);
  }

  focusInput() {
    this.content.scrollToBottom();
    this.markRead(this.inboxChat || this.currentChat);
  }

  blurInput() {
    this.content.scrollToBottom();
  }
  
   markRead(chat) {
    if (chat && this.authUser) {
      let ref = this.db.list(`/private-chats/${this.authUser.key}`);
      ref.update(chat.key, {read: 'true'});
    }
  }
}
