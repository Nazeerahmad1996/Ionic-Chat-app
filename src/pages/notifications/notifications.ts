import { Component } from '@angular/core';
import {
  IonicPage, ModalController, NavController, NavParams,
  ViewController
} from 'ionic-angular';
import {AngularFireDatabase, AngularFireList} from "@angular/fire/database";
import {AuthProvider} from "../../providers/auth/auth";
import {QueryProvider} from "../../providers/query/query";
import { Observable } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-notifications',
  templateUrl: 'notifications.html',
})
export class NotificationsPage {

  authUser: any;
  notifications: any[] = [];
  notificationsRef: AngularFireList<any>;
  notifications$: Observable<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: AngularFireDatabase,
    public authProvider: AuthProvider,
    public queryProvider: QueryProvider,
    public modalCtrl: ModalController,
  ) {
    this.authUser = this.authProvider.getUser();
    this.getNotifications();
  }

  getNotifications() {
    if (this.authUser.key) {
      this.queryProvider.getNotifications(this.authUser.key)
      .subscribe(notifications => {
        let not: any[] = notifications;
        this.notifications = not.reverse();
        this.notifications$ = Observable.of(this.notifications);
      });
    }
  }

  openModal(notification: string) {
    let modal = this.modalCtrl.create(ViewNotificationModal, {notification: notification});
    modal.present();
  }

}

@Component({
  template: `    
    <ion-header>
      <ion-toolbar>
        <ion-title>
          Notification
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
        <h1>{{notification.title}}</h1>
        <p>
          {{notification.message}}
        </p>
      </div>

    </ion-content>
`
})

export class ViewNotificationModal {

  notification: any;
  authUser: any;

  constructor(
    public params: NavParams,
    public viewCtrl: ViewController,
    public queryProvider: QueryProvider,
    public db: AngularFireDatabase,
    public authProvider: AuthProvider,
  ) {
    this.notification = this.params.get('notification');
    this.authUser = this.authProvider.getUser();
    setTimeout(() => {
      this.markRead();
    }, 1000);
  }

  markRead() {
    if (this.notification && this.authUser) {
      let ref = this.db.list(`/flash-messages/${this.authUser.key}`);
      ref.update(this.notification.key, {read: 'true'});
    }
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

}

