import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { AutoUnsubscribe } from '../../auto-unsubscribe.decorator';
import { SessionStorageService } from '../../session-storage.service';
import { TypeUser } from '../../Types/TypeUser';
import { GlobalsService } from '../../global.service';

@Injectable({
  providedIn: 'root'  
})

@AutoUnsubscribe
export class AuthGuard  {
  constructor(private sessionService: SessionStorageService, private globals: GlobalsService){};

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot):boolean {

    let isUserLogged: number = this.sessionService.GetUserLogged();
    let LoggedUser: TypeUser = this.sessionService.GetUser();
    
    let adminCheck = next.data["adminCheck"];
    let printSetupCheck = next.data["printSetupCheck"];

    if (isUserLogged==0){
      return false;
    }

    if (adminCheck) {
      if (LoggedUser.User_Type == 0){
        this.globals.SnackBar("error","You are not authorized fot this Operation", 2000);
        return false
      }
    }
    
    return true;
    }
}