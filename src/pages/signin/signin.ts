import { Component } from '@angular/core';
import {IonicPage, NavController, NavParams, AlertController, LoadingController, Loading} from 'ionic-angular';
import { AngularFireDatabase, AngularFireList } from "@angular/fire/database";

import { AuthProvider } from '../../providers/auth/auth';
import { HomePage } from "../home/home";
import { AdminPage } from "../admin/admin";

import { User } from "../../models/user";
// import { Observable} from "rxjs/Rx";
import {QueryProvider} from "../../providers/query/query";
import { DatetimeProvider } from '../../providers/datetime/datetime';


@IonicPage()
@Component({
  selector: 'page-signin',
  templateUrl: 'signin.html',
})
export class SigninPage {

  loading: Loading;
  user: User;
  usersRef: AngularFireList<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private authProvider: AuthProvider,
    public alertCtrl: AlertController,
    public db: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public queryProvider: QueryProvider,
    public datetimeProvider: DatetimeProvider
  ) {
    this.user = new User();
    this.usersRef = this.db.list('users');
    this.checkAndRedirect();
  }

  ionViewCanEnter() {
    this.checkAndRedirect();
  }

  checkAndRedirect() {
    const user = this.authProvider.getUser();
    if (null !== user) {
      this.goToHomePage();
    }
  }

  goToHomePage() {
    // this.navCtrl.push(HomePage);
    this.navCtrl.setRoot(HomePage);
  }

  gotToAdminPanel() {
    this.navCtrl.push(AdminPage);
  }

  signin() {
    this.presentLoading();
    this.loading.present().then(async () => {
      await this.getUserFromApi();
      setTimeout(() => {
        this.loading.dismiss();
      }, 500)
    });
  }

  async getUserFromApi() {
    this.authProvider.signIn(this.user.email, this.user.password).then(async res => {
      if(res.message) {
        this.showAlert('Error', 'Email or Password incorrect. Please Try Again');
      } else {
        this.fillUserInfo(res);
        await this.checkSavedUSer();
      }
    }, err => {
      this.showAlert('Error', 'Email or Password incorrect. Please Try Again');
    })
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
      // duration: 3000,
      // dismissOnPageChange: true
    });
  }

  fillUserInfo(user) {
    this.user.name = user.name;
    this.user.avatar = user.profile_img;
    this.user.type = user.type;
    this.user.status = 'Hi there I am using Wivesroundtable app';
    this.user.lastActive = this.datetimeProvider.getTimezoneSpecificTimestamp('+1');
  }

  async checkSavedUSer() {
      const users = await this.queryProvider.getUserByEmail(this.user.email);
      if (users.length === 0) {
        await this.saveUser();
      } else {
        this.authProvider.setUser(users[0]);
      }
      this.goToHomePage();
  }

  async saveUser() {
    await this.usersRef.push(this.user)
    const user = await this.queryProvider.getUserByEmail(this.user.email);
    this.authProvider.setUser(user);
    this.checkAndRedirect();
  }

  validInput() {
    if (this.user.email && this.user.password) {
      return false;
    }
    return false;
  }

  showAlert(title: string, msg: string) {
    const alert = this.alertCtrl.create({
      title: title,
      subTitle: msg,
      buttons: ['OK']
    });
    alert.present();
  }


}
