import { Component } from '@angular/core';
import {
  IonicPage,
  NavParams,
  ModalController,
  ViewController,
  AlertController,
  LoadingController,
  ToastController, NavController
} from 'ionic-angular';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import {FlashMessage} from "../../models/flashmessage";
import {QueryProvider} from "../../providers/query/query";
import { Observable } from 'rxjs-compat';
import { map } from "rxjs/operators";
import {HomePage} from "../home/home";
import { DatetimeProvider } from '../../providers/datetime/datetime';

/** ADMIN SCREEN **/

@IonicPage()

@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html',
})
export class AdminPage {

  constructor(
    public modalCtrl: ModalController,
    public navCtrl: NavController
  ) { }

  openModal(action) {

    let modal = this.modalCtrl.create(ModalContentPage, action);
    modal.present();
  }

  goToHomePage() {
    this.navCtrl.push(HomePage);
  }

}

/** ADMIN ACTIONS MODALS **/

@Component({
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>
      <span *ngIf="action === 0">Manage Rooms</span>
      <span *ngIf="action === 1">Monitor Chat</span>
      <span *ngIf="action === 2">Flash Message</span>
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
  
  <ion-list *ngIf="action === 0">
      <ion-item>
        <ion-row class="message_row">
          <ion-col col-9>
            <ion-item no-lines>
              <ion-input type="text" placeholder="Enter room here" [(ngModel)]="newRoom"></ion-input>
            </ion-item>
          </ion-col>
          <ion-col col-3>
            <button ion-button color="primary" (click)="addRoom()" [disabled]="newRoom === ''">
              ADD
            </button>
          </ion-col>
        </ion-row>
      </ion-item>
    
        <ion-item *ngFor="let room of rooms | async">
          {{room.name}}
          <ion-note item-end>
            <button ion-button clear item-end>
              <ion-icon (click)="openModal({roomId: room.key})" name="arrow-forward"></ion-icon>
            </button>
            <button ion-button color="danger" clear>
              <ion-icon (click)="deleteConfirm(room.key)" name="remove-circle"></ion-icon>
            </button>
          </ion-note>
        </ion-item>
  </ion-list>
  
  <ion-list *ngIf="action === 1">

    <div padding>
      
      <ion-item  *ngFor="let report of reports | async">
        <ion-thumbnail item-start>
          <img *ngIf="report" [src]="report.reporter.avatar">
        </ion-thumbnail>
        <h2 *ngIf="report">Reporter: {{report.reporter.name}}</h2>
        <p *ngIf="report.reportedMessage.user">Message reported in {{report.subRoom.name}} room.</p>
        <button ion-button clear item-end (click)="openReportModal(report)">View</button>
      </ion-item>

    </div>

  </ion-list>
  
  <ion-list *ngIf="action === 2">

    <ion-item>
      <ion-label stacked>Title</ion-label>
      <ion-input type="text" [(ngModel)]="flashMessage.title" ></ion-input>
    </ion-item>

    <ion-item>
      <ion-label stacked>Type message here</ion-label>
      <ion-input type="text"  [(ngModel)]="flashMessage.message"></ion-input>
    </ion-item>

    <div padding>
      <button 
        ion-button 
        color="primary" 
        block 
        (click)="sendFlashMessage()" 
        [disabled]="! flashMessage.title || ! flashMessage.message"
      >
        SEND</button>
    </div>

  </ion-list>
  
</ion-content>
`
})

export class ModalContentPage {

  action: number;
  newRoom: string = '';
  rooms: Observable<any>;
  roomsRef: AngularFireList<any>;
  subRoomsRef: AngularFireList<any>;
  flashMessage: FlashMessage;
  flashMessageRef: AngularFireList<any>;
  reports: Observable<any>;

  constructor(
    public params: NavParams,
    public viewCtrl: ViewController,
    public modalCtrl: ModalController,
    public db: AngularFireDatabase,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public queryProvider: QueryProvider,
    public toastCtrl: ToastController,
    public datetimePovider: DatetimeProvider

  ) {
    this.action = this.params.get('action');
    if (this.action === 2) {
      this.flashMessage = new FlashMessage();
    }
    this.roomsRef = this.db.list('rooms');
    this.getRooms();
    this.getReports();
  }

  openModal(room) {
    let modal = this.modalCtrl.create(SubRoomsModal, room);
    modal.present();
  }

  openReportModal(report: any) {
    let modal = this.modalCtrl.create(ReportDetailModal, {report: report});
    modal.present();
  }

  getReports() {
    this.reports = this.queryProvider.getReports();
    // this.reports.subscribe((reports) => {
    //   console.log(reports[0].reportedMessage.user)
    // })
  }

  sendFlashMessage() {
    this.presentLoading(5000);
    this.flashMessage.read = 'false';
    this.flashMessage.createdAt = this.datetimePovider.getTimezoneSpecificTimestamp('+1');
    if (this.flashMessage.title && this.flashMessage.message) {
      this.queryProvider.getUsers()
        .take(1)
        .subscribe(users => {
          this.sendToEach(users);
        })
      setTimeout(() => {
        this.flashMessage.title = '';
        this.flashMessage.message = '';
        this.flashMessage.read = '';
        this.showToast('bottom');
      }, 5000);
    }
  }

  sendToEach(users) {
    users.forEach( user => {
      this.flashMessageRef = this.db.list(`/flash-messages/${user.key}`);
      this.flashMessageRef.push(this.flashMessage);
    })
  }


  addRoom() {
    if (this.newRoom) {
      this.roomsRef.push({ name: this.newRoom });
      this.newRoom = '';
    } else {
      this.showAlert("Error!", "Please enter room");
    }
  }

  getRooms() {
    if (this.action === 0) {
      this.presentLoading();
    }

    this.rooms = this.roomsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );


  }

  removeRoom(roomId: string) {
    this.roomsRef.remove(roomId);
      this.removeSubRooms(roomId);
  }

  removeSubRooms(roomId) {
    this.subRoomsRef = this.db.list(`/subrooms/${roomId}`);
    this.subRoomsRef.remove();
  }

  showToast(position: string) {
    let toast = this.toastCtrl.create({
      message: 'Flash message sent successfully.',
      duration: 2000,
      position: position
    });

    toast.present(toast);
  }




  showAlert(title: string, msg: string) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }

  deleteConfirm(roomId) {
    const confirm = this.alertCtrl.create({
      title: 'Delete Room',
      message: 'Do you agree to delete this room?',
      buttons: [
        {
          text: 'Disagree',
          handler: () => {

          }
        },
        {
          text: 'Agree',
          handler: () => {
            this.removeRoom(roomId);
          }
        }
      ]
    });
    confirm.present();
  }

  presentLoading(delay: number = 1000) {
    this.loadingCtrl.create({
      content: 'Please wait...',
      duration: delay,
      dismissOnPageChange: true
    }).present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}

/** SUB ROOMS MODAL **/

@Component({
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>
      Manage Sub Rooms
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
    <ion-item>
      <ion-row class="message_row">
        <ion-col col-9>
          <ion-item no-lines>
            <ion-input type="text" placeholder="Enter sub room here" [(ngModel)]="newSubRoom"></ion-input>
          </ion-item>
        </ion-col>
        <ion-col col-3>
          <button ion-button color="primary" (click)="addSubRoom()" [disabled]="newSubRoom === ''">
            ADD
          </button>
        </ion-col>
      </ion-row>
    </ion-item>

    <ion-item *ngFor="let room of subRooms | async">
      {{room.name}}
      <ion-note item-end>
        <button ion-button color="danger" clear>
          <ion-icon (click)="deleteConfirm(room.key)" name="remove-circle"></ion-icon>
        </button>
      </ion-note>
    </ion-item>
  </ion-list>
  
</ion-content>
`
})

export class SubRoomsModal {

  roomId: string;
  newSubRoom: string = '';
  subRooms: Observable<any>;
  subRoomsRef: AngularFireList<any>
  messagesRef: AngularFireList<any>;
  membersRef: AngularFireList<any>;

  constructor(
    public params: NavParams,
    public viewCtrl: ViewController,
    public db: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
  ) {
    this.roomId = this.params.get('roomId');
    this.subRoomsRef = this.db.list(`subrooms/${this.roomId}`);
    this.getSubRooms();
  }

  addSubRoom() {
    this.subRoomsRef.push({ name: this.newSubRoom });
    this.newSubRoom = '';
  }

  getSubRooms() {
    this.presentLoading();
    this.subRoomsRef = this.db.list(`subrooms/${this.roomId}`);
    this.subRooms = this.subRoomsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  removeSubRoom(subRoomId: string) {
    this.subRoomsRef.remove(subRoomId);
    this.removeSubRoomMessages(subRoomId);
    this.removeMembers(subRoomId);
  }

  removeSubRoomMessages(subRoomId) {
    this.messagesRef = this.db.list(`/room-messages/${subRoomId}`);
    this.messagesRef.remove();
  }

  removeMembers(subRoomId) {
    this.membersRef = this.db.list(`/members/${subRoomId}`);
    this.membersRef.remove();
  }

  presentLoading() {
    this.loadingCtrl.create({
      content: 'Please wait...',
      duration: 2000,
      dismissOnPageChange: true
    }).present();
  }

  deleteConfirm(subRoomId) {

    const confirm = this.alertCtrl.create({
      title: 'Delete Sub Room',
      message: 'Do you agree to delete this room?',
      buttons: [
        {
          text: 'Disagree',
          handler: () => {

          }
        },
        {
          text: 'Agree',
          handler: () => {
            this.removeSubRoom(subRoomId);
          }
        }
      ]
    });
    confirm.present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}

// REPORT DETAIL MODAL 

@Component({
  template: `    
    <ion-header>
      <ion-toolbar>
        <ion-title>
          Report Detail
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

      <div padding>

      <ion-item>
        <ion-thumbnail item-start>
          <img *ngIf="report" [src]="report.reporter.avatar">
        </ion-thumbnail>
        <h2 *ngIf="report">Reporter: {{report.reporter.name}}</h2>
      </ion-item>

      <ion-item>
        <ion-thumbnail item-start>
          <img *ngIf="report.reportedMessage" [src]="report.reportedMessage.user.avatar">
        </ion-thumbnail>
        <h2 *ngIf="report.reportedMessage">Reported: {{report.reportedMessage.user.name}}</h2>
      </ion-item>

      <ion-item>
        <h2 *ngIf="report"><strong>Room:</strong> {{report.subRoom.name}}</h2>
        <p *ngIf="report.reportedMessage"><strong>Reported Message:</strong> {{report.reportedMessage.message.text}}</p>
      </ion-item>

      <ion-row>
        <ion-col col-6 *ngIf="blocked === false"> 
          <button (click)="confirm('Block')" block ion-button color="danger" class="my-width" large >
            <b>Block User</b>
          </button>
        </ion-col>

        <ion-col col-6 *ngIf="blocked === true"> 
          <button (click)="confirm('Unblock')" block ion-button color="secondary" class="my-width" large >
            <b>Unblock User</b>
          </button>
        </ion-col>

        <ion-col col-6>
          <button (click)="confirmDelete()" ion-button color="primary" block class="my-width" large>
            <b>Delete Report</b>
          </button>
        </ion-col>
      </ion-row>

    </div>

    </ion-content>
`
})

export class ReportDetailModal {

  report: any;
  reportsRef: AngularFireList<any>;
  blockingRef: AngularFireList<any>;
  blockRef: AngularFireList<any>;
  blocked: boolean = false;
  blocking: any[] = [];

  constructor(
    public params: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public db: AngularFireDatabase,
    public queryProvider: QueryProvider
  ) {
    this.report = this.params.get('report');
    this.reportsRef = this.db.list(`reports`);
    this.getBlocking();
  }

  confirm(title: string) {
    const confirm = this.alertCtrl.create({
      title: `${title} User`,
      message: `Are you sure you want to ${title} this user from ${this.report.subRoom.name} room ?`,
      buttons: [
        {
          text: 'Disagree',
          handler: () => {
          }
        },
        {
          text: 'Agree',
          handler: () => {
            if (title.toLocaleLowerCase() == 'block') {
              this.blockUser();
            }
            if (title.toLocaleLowerCase() == 'unblock') {
              this.unblockUser();
            }
          }
        }
      ]
    });
    confirm.present();
  }

  confirmDelete() {
    const confirm = this.alertCtrl.create({
      title: 'Delete Report',
      message: `Are you sure you want to delete this report ?`,
      buttons: [
        {
          text: 'Disagree',
          handler: () => {
          }
        },
        {
          text: 'Agree',
          handler: () => {
            this.deleteReport();
          }
        }
      ]
    });
    confirm.present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  deleteReport() {
    if (this.report) {
      let promise = this.reportsRef.remove(this.report.key);
      promise
      .then(_ => {
        this.dismiss();
      })
    }
  }

  blockUser() {
    if (this.report.reportedMessage.user && this.report.subRoom) {
      this.blockRef = this.db.list(`/blocking/${this.report.reportedMessage.user.key}`);
      this.blockRef.push(this.report.subRoom.key)
      .then(_ => {
        this.blocked = true;
      })
    }
  }

  getBlocking() {
    if (this.report.reportedMessage.user) {
      this.queryProvider.getBlocking(this.report.reportedMessage.user)
      // .take(1)
      .subscribe( roomsKeys => {
        if ( ! this.checkIfBlocked(roomsKeys)) { 
          this.blocking = roomsKeys;
          this.blocked = true;
        }
      })
    }
  }

  checkIfBlocked(blockings: any): boolean {
    if (blockings.length !== 0) {
      return blockings.every( block => {
        return block.value != this.report.subRoom.key
      });
    }

    return true;
  }

  unblockUser() {
    if (this.blocking.length !== 0) {
      let found = this.findBlocking();
      if (found) {
        this.removeKey(found.key);
      }
    } 
  }

  findBlocking(): any {
    if (this.blocking.length !== 0) {
      return this.blocking.find(el => {
        return el.value == this.report.subRoom.key;
      })
    } 
  }

  removeKey(key: string) {
    if (this.report.reportedMessage.user.key) {
      this.blockingRef = this.db.list(`/blocking/${this.report.reportedMessage.user.key}`);
      let promise = this.blockingRef.remove(key);
      promise
      .then(_ => {
        this.blocked = false;
      })
    }
  }

}


