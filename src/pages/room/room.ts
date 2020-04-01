import { Component } from '@angular/core';
import {ActionSheetController, IonicPage, NavController, NavParams} from 'ionic-angular';

/**
 * Generated class for the RoomPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-room',
  templateUrl: 'room.html',
})
export class RoomPage {

    template: '<ion-list><ion-list-header>Ionic</ion-list-header><button ion-item (click)="close()">Learn Ionic</button></ion-list>';


  constructor(public navCtrl: NavController, public navParams: NavParams, public actionSheetCtrl: ActionSheetController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RoomPage');
  }

    presentActionSheet() {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Available Members',
            buttons: [
                {
                    text: 'Destructive',
                    role: 'destructive',
                    handler: () => {
                        console.log('Destructive clicked');
                    }
                },
                {
                    text: 'Archive',
                    handler: () => {
                        console.log('Archive clicked');
                    }
                },
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                }
            ],
        });

        actionSheet.present();
    }

}
