import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from "../../models/user";
import { Subject } from "rxjs/Rx";
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable()
export class AuthProvider {

  baseURL: string = 'https://wivesroundtable.com.ng/members-area/api';
  public user = new Subject<any>();

  constructor(public http: HttpClient, public db: AngularFireDatabase) {
    this.user.next(this.getUser());
  }

  getUser(): User {
    if (localStorage.getItem('user')) {
      return JSON.parse(localStorage.getItem('user'))
    }
    return null;
  }

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  signIn(email: string, password: string): Promise<any> {
    const encryptedPassword = encodeURIComponent(window.btoa(password));
    return this.http.get(
      `${this.baseURL}/users.php?email=${email}&password=${encryptedPassword}`
      )
      .first()
      .toPromise();
  }

  logout() {
    if (localStorage.getItem('user')) {
      localStorage.removeItem('user');
      return true;
    }
    
    return false;
  }

  updateUserStatus(status) {
    let user = this.getUser();
    user.status = status;
    this.setUser(user);
    this.user.next(user);
  }

}
