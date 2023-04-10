import { EventEmitter, Injectable } from '@angular/core';
import OneSignal from 'onesignal-cordova-plugin';
import OSNotification from 'onesignal-cordova-plugin/www/OSNotification';
import { StorageService } from './storage.service';


@Injectable({
  providedIn: 'root'
})
export class PushService {
  
  mensajes : OSNotification[] = [];
  pushListener = new EventEmitter<OSNotification>();
  userId!: string;

  constructor(private storageService: StorageService) {
    this.cargarMensajes();
  }

  oneSignalInit(): void {
    // Uncomment to set OneSignal device logging to VERBOSE  
    OneSignal.setLogLevel(6, 0);

    // NOTE: Update the setAppId value below with your OneSignal AppId.
    OneSignal.setAppId("bc8d4a37-dd24-4537-b62c-1885cfd1364f");

    OneSignal.setNotificationWillShowInForegroundHandler((notificationReceivedEvent) => {
      const noti = notificationReceivedEvent.getNotification();      
      this.notificacionRecibida(noti);
      notificationReceivedEvent.complete(noti);      
      
     // console.log('notificationRecibida: ',notificationReceivedEvent);
     //notificationReceivedEvent.complete(notificationReceivedEvent.getNotification());
    });

    OneSignal.setNotificationOpenedHandler(async (jsonData) => {
      console.log('notificationOpenedCallback: ',jsonData);

      await this.notificacionRecibida(jsonData.notification);
   });

    // Prompts the user for notification permissions.
    //    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 7) to better communicate to your users what notifications they will get.
    OneSignal.promptForPushNotificationsWithUserResponse(function(accepted) {
        console.log("User accepted notifications: " + accepted);
    });

    OneSignal.getDeviceState(handler => {
      this.userId = handler.userId;
      console.log(this.userId);      
    })

  }

  async notificacionRecibida(noti: OSNotification){
    await this.cargarMensajes();
    const isNoti = this.mensajes.find(msj => noti.notificationId === msj.notificationId);
    
    if (isNoti) { return; }

    this.mensajes.unshift(noti);
    this.pushListener.emit(noti);
      

    this.storageService.set('pushes', this.mensajes)
  }

  async cargarMensajes(){
    this.mensajes = await this.storageService.get('pushes') || [];
  }

  async getMensajes(){
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  async getUserId(){
    return await this.userId;
  }

  async borrarMensajes(){
    await this.storageService.remove('pushes');
    this.mensajes = [];
    this.storageService.set('pushes', this.mensajes)

  }
}
