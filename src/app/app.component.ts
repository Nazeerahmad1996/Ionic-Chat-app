import { Component } from '@angular/core';
import {Platform, ToastController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { App } from 'ionic-angular';
import { SigninPage } from '../pages/signin/signin';
// import {RoomListPage} from "../pages/room-list/room-list";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = SigninPage;
    lastBack = Date.now();
    spamming = false;
  // rootPage:any = RoomListPage;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, public app: App,toast: ToastController) {
    // platform.ready().then(() => {
    //   // Okay, so the platform is ready and our plugins are available.
    //   // Here you can do any higher level native things you might need.
    //   statusBar.styleDefault();
    //   if (platform.is('android')) {
    //       statusBar.overlaysWebView(false);
    //       statusBar.backgroundColorByHexString('#000000');
    //   }
    //   splashScreen.hide();
    //     platform.registerBackButtonAction(() => {
    //         let closeDelay = 2000;
    //         let spamDelay = 500;

    //         if (((Date.now() - this.lastBack) < closeDelay) &&
    //             (Date.now() - this.lastBack) > spamDelay) {
    //             // Leaves app if user pressed button not faster than 500ms a time,
    //             // and not slower than 2000ms a time.
    //             platform.exitApp();
    //         } else {
    //             if (!this.spamming) { // avoids multiple toasts caused by button spam.
    //                 let t = toast.create({
    //                     message: "Press again to exit ..",
    //                     duration: closeDelay,
    //                     dismissOnPageChange: true
    //                 });
    //                 t.onDidDismiss(() => this.spamming = false);
    //                 t.present();
    //             }
    //             this.spamming = true;
    //         }

    //         this.lastBack = Date.now();
    //     });
    // });
  }
}

