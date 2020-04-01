import {Component, ViewChild} from '@angular/core';
import {
  IonicPage,
  NavController,
  NavParams, ModalController,
  ViewController,
  AlertController,
  Content,
  App
} from 'ionic-angular';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { map } from "rxjs/operators";
import {AuthProvider} from "../../providers/auth/auth";
import {Observable,} from "rxjs/Rx";
import {Message} from "../../models/message";
import {PrivateChatPage} from "../private-chat/private-chat";
import {QueryProvider} from "../../providers/query/query";
import {DatetimeProvider} from "../../providers/datetime/datetime";
import "rxjs-compat/add/operator/take";


@IonicPage()
@Component({
  selector: 'page-room-chat',
  templateUrl: 'room-chat.html',
})
export class RoomChatPage {

  room: any;
  newMessage: Message;
  messages: Observable<any>;
  subRoom: any;
  authUser: any;
  replyToMessage: any = null;
  roomRef: AngularFireList<any>;
  membersRef: AngularFireList<any>;
  messagesRef: AngularFireList<any>;
  reportsRef: AngularFireList<any>;
  members: any = [];

  @ViewChild(Content) content: Content;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public db: AngularFireDatabase,
    public alertCtrl: AlertController,
    public authProvider: AuthProvider,
    public queryProvider: QueryProvider,
    public datetimeProvider: DatetimeProvider
    // public content: Content
  ) {
    this.authUser = this.authProvider.getUser();
    this.newMessage = new Message();
    const data = navParams.get('data');
    this.room = data.room;
    this.subRoom = data.subRoom;
    this.init();
  }

  init() {
    this.getMembers();
    this.getRoomMessages();
    // setInterval(() => {
    //   this.removeInActive();
    // }, 5000);
  }

  ionViewDidLoad(){
    this.scrollToBottom();
  }
  ionViewDidEnter() {
    this.checkOrCreateMember();
    this.scrollToBottom();
  }

  openModal(subRoom) {
    let modal = this.modalCtrl.create(ModalMembers, subRoom);
    modal.present();
  }

  scrollToBottom() {
    this.content.scrollToBottom();
  }

  async checkOrCreateMember() {
    if (this.authUser) {
      const members = await this.queryProvider.getRoomMembers(this.subRoom.key, this.authUser);
      if (members.length > 0) {
        if (! this.findMember(members)) {
          this.createMember(this.authUser);
        } 
      } else {
        this.createMember(this.authUser);
      }
    }
  }

  findMember(members: any[]) {
    return members.find(member => {
      return member.key == this.authUser.key;
    });
  }

  async createMember(user: any) { 
    if (user) {
      user.lastActive = this.datetimeProvider.getTimezoneSpecificTimestamp('+1');
      this.membersRef = this.db.list(`/members/${this.subRoom.key}`);
      await this.membersRef.push(user);
    }
  }

  getMembers() {
    const ref = this.db.list(`/members/${this.subRoom.key}`);
    ref.snapshotChanges().pipe(
      map(changes => 
        changes.map(c => ({ memberKey: c.payload.key, ...c.payload.val() }))
      )
    )
    .subscribe( members => {
      if (members.length !== 0) {
        this.members = members;
      }
    })
  }

  ionViewDidLeave() {
    this.removeInActive();
  }

  removeInActive() {
    if (this.members.length !== 0) { 
      const ref = this.db.list(`/members/${this.subRoom.key}`);
      this.members.forEach((member, index) => {
      if (member.key == this.authUser.key) {
        ref.remove(member.memberKey)
        .then(() => {
            this.members.splice(index, 1);
        });
      }
    })
    }
  }

  leftRoom(member: any): boolean { 
    let currentDate: any = new Date(this.datetimeProvider.getTimezoneSpecificTimestamp('+1'));
    let lastActive: any = new Date(member.lastActive);
    let FIVE_MIN: any = (5*60*1000);
    // console.log(`${currentDate -  lastActive} time diff ${FIVE_MIN}`);
    if((currentDate -  lastActive) > FIVE_MIN) {
      return true;
    }

    return false;
  }

  actionList(message) {
    let alert = this.alertCtrl.create();
    alert.setTitle('Actions');

    alert.addInput({
      type: 'radio',
      label: 'Report Message',
      value: 'report',
      checked: false
    });

    alert.addInput({
      type: 'radio',
      label: 'Reply Message',
      value: 'reply',
      checked: false
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: input => {
        if (input === 'reply') {
          this.replyToMessage = message;
          this.showReplyPrompt(message);
        }
        if (input === 'report') {
          this.reportMemberMessage(message);
        }
      }
    });
    alert.present();
  }

  showReplyPrompt(msg: any) {
    const prompt = this.alertCtrl.create({
      title: `Reply to (${msg.user.name})`,
      message: msg.message.text,
      inputs: [
        {
          name: 'reply',
          placeholder: 'Type reply here...'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {

          }
        },
        {
          text: 'Send',
          handler: data => {
            this.sendMessage(data.reply);
          }
        }
      ]
    });
    prompt.present();
  }

  reportMemberMessage(message: any) {
    if (this.authUser && this.subRoom && message) {
      this.reportsRef = this.db.list(`/reports`);
      this.reportsRef.push({
        reporter: this.authUser,
        subRoom: this.subRoom,
        reportedMessage: message
      })
    }
  }

  sendMessage(reply: string = null) {
    this.checkOrCreateMember();
    this.messagesRef = this.db.list(`/room-messages/${this.subRoom.key}`);
    const user = this.authProvider.getUser();

    if (null !== reply) {
      // console.log(reply);
      this.newMessage.text = reply;
      this.newMessage.timestamp = this.datetimeProvider.getTimezoneSpecificTimestamp('+1');
      this.newMessage.timeAsString = this.formatTime(this.datetimeProvider.getTimezoneSpecificTimestamp('+1'));
      this.messagesRef.push({user: user, message: this.newMessage, replyTo: this.replyToMessage})
      this.replyToMessage = null;
    } else {
      if (this.newMessage.text && null !== user) {
        this.newMessage.timestamp = this.datetimeProvider.getTimezoneSpecificTimestamp('+1');
        this.newMessage.timeAsString = this.formatTime(this.datetimeProvider.getTimezoneSpecificTimestamp('+1'));        
        this.messagesRef.push({user: user, message: this.newMessage})
      }
    }
    this.newMessage.text = '';
    this.content.scrollToBottom();
  }

  getRoomMessages() {
    this.messages = this.queryProvider.getChatRoomMessages(this.subRoom.key, 20);
    this.messages.subscribe(() => {
      this.scrollToBottom();
    })
  }

  formatTime(time) {
    return this.datetimeProvider.formatAMPM(time);
  }

  focusInput() {
      this.content.scrollToBottom();
  }

  blurInput() {
      this.content.scrollToBottom();
  }
}

/** SUB ROOMS MODAL **/

@Component({
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>
      Members
    </ion-title>
    <ion-buttons start>
      <button ion-button (click)="dismiss()">
        <span ion-text color="primary" showWhen="ios">Cancel</span>
        <ion-icon name="md-close" showWhen="android, windows"></ion-icon>
      </button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>

  <ion-list>
    <span *ngFor="let member of members | async">
      <ion-item *ngIf="member.key == authUser.key">
        <h2><strong>{{member.name}}</strong></h2>
        <ion-note item-end>
          <span *ngIf="authUser.type === 'counselor'" class="user-type">{{authUser.type}}</span>
          <button *ngIf="member.email != authUser.email" ion-button color="primary" clear large style="text-transform: none;">
            <span>(chat) 
              <ion-icon name="chatboxes"></ion-icon>
            </span>
          </button>
        </ion-note>
      </ion-item>
      <ion-item *ngIf="member.key != authUser.key" (click)="gotToPrivateChat(member)">
        <h2><strong>{{member.name}}</strong></h2>
        <ion-note item-end>
          <button *ngIf="member.email != authUser.email" ion-button color="primary" clear large>
            <span>(Chat) </span>
            <ion-icon name="chatboxes"></ion-icon>
          </button>
        </ion-note>
      </ion-item>
    </span>
  </ion-list>
  
</ion-content>
`
})

export class ModalMembers {

  subRoom: any;
  members: Observable<any>;
  membersRef: AngularFireList<any>
  authUser: any;

  constructor(
    public viewCtrl: ViewController,
    public db: AngularFireDatabase,
    public params: NavParams,
    public navCtrl: NavController,
    public authProvider: AuthProvider,
    public navController: NavController,
    public appCtrl: App
  ) {
    this.authUser = this.authProvider.getUser();
    this.subRoom = this.params.get('subRoom');
    this.membersRef = this.db.list(`members/${this.subRoom.key}`);
    this.getMembers();
  }

  getMembers() {
    this.members = this.membersRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  gotToPrivateChat(member) {
    this.viewCtrl.dismiss();
    this.appCtrl.getRootNav().push(PrivateChatPage, {
      member: member
    });
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
