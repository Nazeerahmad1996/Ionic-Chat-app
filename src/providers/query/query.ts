import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs/Rx";
import {AngularFireDatabase, AngularFireList} from "@angular/fire/database";
import {map} from "rxjs/operators";
// import {switchMap} from "rxjs-compat/operator/switchMap";
import {AuthProvider} from "../auth/auth";

@Injectable()
export class QueryProvider {

  authUser: any;
  usersRef: AngularFireList<any>;
  chatRef: AngularFireList<any>;
  messagesRef: AngularFireList<any>;
  flashMessagesRef: AngularFireList<any>;
  reportsRef: AngularFireList<any>;
  blockingRef: AngularFireList<any>;
  subRoomsRef: AngularFireList<any>

  public subRoomsObserver = new Subject<any>();

  constructor(
    public http: HttpClient,
    public db: AngularFireDatabase,
    public authProvider: AuthProvider
  ) {

    this.authUser = this.authProvider.getUser();
    this.usersRef = this.db.list('/users');
    if (this.authUser) {
      this.flashMessagesRef = this.db.list(`/flash-messages/${this.authUser.key}`);
      this.chatRef = this.db.list(`/private-chats/${this.authUser.key}`);
    }
  }

  getUserByEmail(email: string): Promise<any>{
    return this.db.list(
      '/users',
      ref => ref.orderByChild('email').equalTo(email)
    ).snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    )
    .first()
    .toPromise();
  }

  getUsers(): Observable<any> {
    return this.usersRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  getChats(key: any): Observable<any> {
    this.chatRef = this.db.list(`/private-chats/${key}`);
    return this.chatRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  getMessages(key: string): Observable<any> {
    this.messagesRef = this.db.list(`/chat-messages/${key}`);
    return this.messagesRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  getChatRoomMessages(key: string, limit: number): Observable<any> {
    return this.db.list(
      `/room-messages/${key}`,
      ref => ref.limitToLast(limit)
    ).snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  getPrivateMessages(key: string, limit: number): Observable<any> {
    return this.db.list(
      `/chat-messages/${key}`,
      ref => ref.limitToLast(limit)
    ).snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  getLastPrivateMessage(key: string, limit: number = 1): Observable<any> {
    if (key) {
      return this.db.list(
        `/chat-messages/${key}`,
        ref => ref.limitToLast(limit)
      ).snapshotChanges().pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      );
    }
  }

  getNotifications(key: string): Observable<any> {
    if (key) {
      return this.db.list(
        `/flash-messages/${key}`,
        ref => ref.orderByKey()
      ).snapshotChanges().pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      );
    }
  }

  getUnreadMessageCount(key): any {
    if (key) {
      this.chatRef = this.db.list(`/private-chats/${key}`);
    }
  }

  getLastNotification(key: string, limit: number = 1): Observable<any> {
      return this.db.list(
        `/flash-messages/${key}`,
        ref => ref.limitToLast(limit)
      ).snapshotChanges().pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      );
  }

  getLastChat(key: string, limit: number = 1): Observable<any> {
    return this.db.list(
      `/private-chats/${key}`,
      ref => ref.limitToLast(limit)
    ).snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  markNotificationsAsRead(key: string): Promise<any> {
    if (key) {
      return this.flashMessagesRef.update(key, {read: 'true'});
    }
  }

  async markChatAsRead(key: string): Promise<any> {
    return await this.chatRef.update(key, {read: 'true'});
  }

  getReports(): Observable<any>{
    this.reportsRef = this.db.list(`reports`);
    return this.reportsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
  }

  getBlocking(user: any): Observable<any> {
    this.blockingRef = this.db.list(`/blocking/${user.key}`);
    return this.blockingRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, value: c.payload.val() }))
      )
    );
  }

  getBlockedRooms(key: any) {
    this.blockingRef = this.db.list(`/blocking/${key}`);
    return this.blockingRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, value: c.payload.val() }))
      )
    )
    .first()
    .toPromise();
  }

  getSubRooms(roomKey: string) {
    this.subRoomsRef = this.db.list(`subrooms/${roomKey}`);
    return this.subRoomsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    )
    .first()
    .toPromise();
  }

  getReceiverChats(key: any): Promise<any> {
    this.chatRef = this.db.list(`/private-chats/${key}`);
    return this.chatRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    )
    .first()
    .toPromise();
  }

  getRoomMembers(key: string, user: any): Promise<any> {
    return this.db.list(
      `/members/${key}`,
      ref => ref.orderByChild('email').equalTo(user.email)
    ).valueChanges()
    .first()
    .toPromise();
  }

}
