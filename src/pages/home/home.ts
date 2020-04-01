import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {InboxPage} from "../inbox/inbox";
import {NotificationsPage} from "../notifications/notifications";
import {ProfilePage} from "../profile/profile";
import {RoomListPage} from "../room-list/room-list";
import {AuthProvider} from "../../providers/auth/auth";
import {QueryProvider} from "../../providers/query/query";
import {AdminPage} from "../admin/admin";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  authUser: any;
  notificationCount: number = 0;
  chatCount: number = 0;
  lastNotification: any;
  lastChat: any;
  chat: any;

  roomsTab = RoomListPage;
  inboxTab = InboxPage;
  notificationTab = NotificationsPage;
  profileTab = ProfilePage;
  adminTab = AdminPage;

  constructor(
    public navCtrl: NavController,
    public authProvider: AuthProvider,
    public queryProvider: QueryProvider

  ) {
    this.authUser = this.authProvider.getUser();
    if (this.authUser) {
      this.unreadNotifications();
      this.unreadChat();
    }
  }

  unreadNotifications() {
    if (this.authUser) {
      this.queryProvider.getLastNotification(this.authUser.key)
        .subscribe(queriedNotifications => {
          if (queriedNotifications[0]) {
            this.lastNotification = queriedNotifications[0];
            // console.log(queriedNotifications[0]);
            if (queriedNotifications[0].read == 'false') {
              this.notificationCount = 1;
            }
          }
        })
    }
  }

  unreadChat() {
    if (this.authUser) {
      this.queryProvider.getChats(this.authUser.key)
        .subscribe(chats => {
          if(chats.length > 0) {
            if ( ! this.getUnreadChat(chats)) {
              this.chatCount = 1;
            } else {
              this.chatCount = 0;
            }
          }
        })
    }
  }

  getUnreadChat(chats): boolean {
    return chats.every(chat => {
      return chat.read == 'true';
    })
  }

  viewNotifications() {
    this.notificationCount = 0;
  }

}
