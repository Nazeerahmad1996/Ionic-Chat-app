import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RoomChatPage } from './room-chat';

@NgModule({
  declarations: [
    RoomChatPage,
  ],
  imports: [
    IonicPageModule.forChild(RoomChatPage),
  ],
})
export class RoomChatPageModule {}
