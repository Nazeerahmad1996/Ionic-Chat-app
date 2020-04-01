import { Component, ChangeDetectorRef } from '@angular/core';
import {IonicPage, Loading, LoadingController, NavController, App} from 'ionic-angular';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { map } from "rxjs/operators";
import { RoomChatPage } from "../room-chat/room-chat";
import { AuthProvider } from '../../providers/auth/auth';
import { QueryProvider } from '../../providers/query/query';

@IonicPage()
@Component({
  selector: 'page-room-list',
  templateUrl: 'room-list.html',
})
export class RoomListPage {

  rooms: any[];
  subRooms: Array<any> = [];
  roomsRef: AngularFireList<any>;
  subRoomsRef: AngularFireList<any>
  authUser: any;
  blockings: any[] = [];

  loading: Loading;
  shownGroup = null;

  constructor(
    public navCtrl: NavController,
    public db: AngularFireDatabase,
    public loadingCtrl: LoadingController,
    public authProvider: AuthProvider,
    public queryProvider: QueryProvider,
    public ref: ChangeDetectorRef,
    public appCtrl: App
    ) {
    this.authUser = this.authProvider.getUser();
    this.roomsRef = this.db.list('rooms');
    this.getRooms();
  }

  getRooms() {
    this.presentLoading();
    this.roomsRef.snapshotChanges().pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      ).subscribe(rooms => {
        this.loading.dismiss();
        this.rooms = rooms;
      },
      error => {
        // this.loading.dismiss();
        console.log(error);
      });
  }

  async getSubRooms(roomKey: string) {
    let blockedRooms = await this.queryProvider.getBlockedRooms(this.authUser.key);
    let subRooms = await this.queryProvider.getSubRooms(roomKey);
    if (blockedRooms.length > 0) {
      blockedRooms.forEach(block => {
        subRooms.forEach(room => {
          if (room.key === block.value) {
            room['block'] = true;
          } else {
            room['block'] = false;
          }
          this.subRooms.push(room)
        })
      })
    } else {
      this.subRooms = subRooms;
    }
    // this.ref.markForCheck();
    console.log(this.subRooms)
  }

  toggleGroup(group, roomKey) {
      this.subRooms = [];
      this.getSubRooms(roomKey);
      if (this.isGroupShown(group)) {
        this.shownGroup = null;
      } else {
        this.shownGroup = group;
      }
  }

  isGroupShown(group) {
    return this.shownGroup === group;
  }

  gotToChat(roomKey: string, subRoomKey: string) {
    this.appCtrl.getRootNav().push(RoomChatPage, {
      data: {
        room: roomKey,
        subRoom: subRoomKey
      },
    });
  }

  presentLoading() {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...',
    });
  }

}
