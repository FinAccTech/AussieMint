import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../Dashboard/Services/user.service';
import { Router } from '@angular/router';
import { SessionStorageService } from '../../session-storage.service';
import { GlobalsService } from '../../global.service';

@Component({
    selector: 'app-login',
    imports: [FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})

export class LoginComponent {
  
  UserName: string = "";
  Password: string = "";
  CheckState: number = 0;

  constructor(private usrService: UserService, private router: Router, private sessionService: SessionStorageService, private globals: GlobalsService ){}

  CheckUser(){
    this.CheckState = 1;
    if (  this.globals.DateToInt(new Date()) > 20250315){      
      return;     
    }

    this.usrService.CheckUserandgetCompanies(this.UserName, this.Password).subscribe(data=>{          
          
      if (data.queryStatus == 1){
        
        this.CheckState = 2;
        sessionStorage.clear();
        
        this.sessionService.SetUserLogged();
        this.sessionService.SetUser(data.apiData.UserInfo[0]);
       
        if (data.apiData.CompInfo.length !== 0){
          this.sessionService.SetCompany(data.apiData.CompInfo[0]);
          this.sessionService.sendCompUpdate(data.apiData.CompInfo[0]);
          this.sessionService.SetAppSetup(data.apiData.AppSetup[0]);
        }        
        
        this.router.navigate(['/dashboard']);
      }
      else{
        this.CheckState = 3;
      }      
      
    })
  }
}
