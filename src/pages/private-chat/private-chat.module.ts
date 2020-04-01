import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PrivateChatPage } from './private-chat';

@NgModule({
  declarations: [
    PrivateChatPage,
  ],
  imports: [
    IonicPageModule.forChild(PrivateChatPage),
  ],
})
export class PrivateChatPageModule {}
