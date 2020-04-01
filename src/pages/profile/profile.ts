import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, ModalController, ViewController, App} from 'ionic-angular';
import { AuthProvider } from '../../providers/auth/auth';
import { SigninPage } from '../signin/signin';
import { AngularFireList, AngularFireDatabase } from '@angular/fire/database';
/**
 * Generated class for the ProfilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  authUser: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public app: App,
    private authProvider: AuthProvider,
    ) {
      this.authUser = this.authProvider.getUser();
      console.log(this.authUser)
      // Get user when state changes
      this.authProvider.user.subscribe( usr => {
        this.authUser = usr;
      })
  }

  openStatusModal(action) {

    let modal = this.modalCtrl.create(StatusModalPage, action);
    modal.present();
  }

  logout() {
    if (this.authProvider.logout()) {
      this.gotToSigninPage();
    }
  }

  gotToSigninPage() {
    this.app.getRootNavs()[0].setRoot(SigninPage);
  }

}

/** STATUS MODAL **/

@Component({
  template: `
<ion-header>
  <ion-toolbar>
    <ion-title>
      Update Status
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
  <ion-label stacked>Type status here</ion-label>
  <ion-input type="text" [(ngModel)]="newStatus"></ion-input>
</ion-item>

<div padding>
  <button 
    ion-button 
    color="primary" 
    block 
    (click)="updateStatus()"
    [disabled]=" ! newStatus"
  >
    UPDATE</button>
</div>

</ion-list>
  
</ion-content>
`
})

export class StatusModalPage {

  newStatus: string;
  authUser: any;
  userRef: AngularFireList<any>;

  constructor(
    public viewCtrl: ViewController,
    public db: AngularFireDatabase,
    private authProvider: AuthProvider,
  ) {
    this.authUser = this.authProvider.getUser();
    this.userRef = this.db.list(`users`);
  }

  updateStatus() {
    if (this.newStatus) {
      const promise = this.userRef.update(this.authUser.key, {status: this.newStatus});
      promise.then(res => {
        this.authProvider.updateUserStatus(this.newStatus);
        this.resetUser();
        this.newStatus = '';
        this.dismiss();
      })
    }
  }

  resetUser() {
    this.authUser = this.authProvider.getUser();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
