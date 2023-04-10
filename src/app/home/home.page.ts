import { ApplicationRef, Component, OnInit } from '@angular/core';
import { PushService } from '../services/push.service';
import OSNotification from 'onesignal-cordova-plugin/www/OSNotification';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  mensajes : OSNotification[] = [] ;
  userId!:string;

  constructor(private pushService:PushService,
              private applicationRef: ApplicationRef) {               
              }

  ngOnInit(){
    this.pushService.pushListener
      .subscribe(noti => {
        this.mensajes.unshift(noti);
        this.applicationRef.tick();                    
      })    
  }

  async ionViewWillEnter(){
    this.mensajes = await this.pushService.getMensajes();
    this.userId = await this.pushService.getUserId();
  }

  async borrarMensajes(){
    await this.pushService.borrarMensajes();
    this.mensajes = [];
  }

  

}
