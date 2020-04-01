import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { SigninPage } from '../pages/signin/signin';
import { AuthProvider } from '../providers/auth/auth';
import { InboxPage } from "../pages/inbox/inbox";
import {NotificationsPage, ViewNotificationModal} from "../pages/notifications/notifications";
import { ProfilePage } from "../pages/profile/profile";
import { RoomPage } from "../pages/room/room";
import { AdminPage, ReportDetailModal } from "../pages/admin/admin";
import { ModalContentPage } from "../pages/admin/admin";
import { SubRoomsModal } from "../pages/admin/admin";
import { RoomListPage } from "../pages/room-list/room-list";
import { RoomChatPage, ModalMembers} from "../pages/room-chat/room-chat";
import {PrivateChatPage} from "../pages/private-chat/private-chat";
import { QueryProvider } from '../providers/query/query';
import { DatetimeProvider } from '../providers/datetime/datetime';
import {AdminPageModule} from "../pages/admin/admin.module";
import {InboxPageModule} from "../pages/inbox/inbox.module";
import {RoomPageModule} from "../pages/room/room.module";
import {RoomListPageModule} from "../pages/room-list/room-list.module";
import {RoomChatPageModule} from "../pages/room-chat/room-chat.module";
import {NotificationsPageModule} from "../pages/notifications/notifications.module";
import {PrivateChatPageModule} from "../pages/private-chat/private-chat.module";
import {ProfilePageModule} from "../pages/profile/profile.module";
import {SigninPageModule} from "../pages/signin/signin.module";
import { StatusModalPage } from "../pages/profile/profile";

const firebaseConfig = {
  apiKey: "AIzaSyBecdHR9KVt0y_8o13YnCSoMXvXu60wSH0",
  authDomain: "chat-app-56a10.firebaseapp.com",
  databaseURL: "https://chat-app-56a10.firebaseio.com",
  projectId: "chat-app-56a10",
  storageBucket: "chat-app-56a10.appspot.com",
  messagingSenderId: "903181611939"
};

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ModalContentPage,
    SubRoomsModal,
    ViewNotificationModal,
    StatusModalPage,
    ReportDetailModal,
    ModalMembers
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AdminPageModule,
    InboxPageModule,
    RoomPageModule,
    RoomListPageModule,
    RoomChatPageModule,
    NotificationsPageModule,
    PrivateChatPageModule,
    ProfilePageModule,
    SigninPageModule,
    AngularFireDatabaseModule,
    HttpClientModule,
    HttpClientJsonpModule,
    AngularFireModule.initializeApp(firebaseConfig)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    SigninPage,
    InboxPage,
    NotificationsPage,
    ProfilePage,
    RoomPage,
    AdminPage,
    ModalContentPage,
    SubRoomsModal,
    RoomListPage,
    RoomChatPage,
    PrivateChatPage,
    ViewNotificationModal,
    StatusModalPage,
    ReportDetailModal,
    ModalMembers
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    QueryProvider,
    DatetimeProvider
  ]
})
export class AppModule {}
