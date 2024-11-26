import { Injectable, signal } from '@angular/core';
import { TypeUser } from './Types/TypeUser';
import { TypeCompanies } from './Types/TypeCompanies';
import { Observable, Subject } from 'rxjs';
import { TypeAppSetup } from './Types/TypeAppSetup';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  private subjectName = new Subject<TypeCompanies>();

  constructor() { }

  private UserLogged = signal<number>(0);
  private LoggedUser = signal<TypeUser>({UserSno:0,UserName:"",Password:"",User_Type: 0, Active_Status: 0, Profile_Image: "", Image_Name: "", Enable_WorkingHours: 0, FromTime: "", ToTime: ""});
  private SelectedCompany = signal<TypeCompanies>({ CompSno: 0, Comp_Code: "", Comp_Name: "", Fin_From: 0, Fin_To: 0, Books_From: 0, Address1: "", Address2: "", Address3: "", City: "", State: "", Pincode: "", Email: "", Phone: "", License_No: "", Hide_Status: 0, App_Version: 0, Db_Version: 0, Status: 0, CommMasters:0,});
  private AppSetup = signal<TypeAppSetup> ({SetupSno:0, AreaCode_AutoGen: 0, AreaCode_Prefix: "", AreaCode_CurrentNo: 0, ClientCode_AutoGen: 0, ClientCode_Prefix: "", ClientCode_CurrentNo: 0, GrpCode_AutoGen: 0, GrpCode_Prefix: "", GrpCode_CurrentNo: 0, ItemCode_AutoGen: 0, ItemCode_Prefix: "", ItemCode_CurrentNo: 0, UomCode_AutoGen: 0, UomCode_Prefix: "", UomCode_CurrentNo: 0, Images_Mandatory: 0, Allow_DuplicateItems: 0, Disable_AddLess: 0, Entries_LockedUpto: 0, Enable_Authentication: 0, Enable_OldEntries: 0, MobileNumberMandatory: 0,CompSno: 0,})

  GetUserLogged(){
    this.UserLogged.update (() =>  +sessionStorage.getItem("sessionUserLogged")!);  
    return this.UserLogged();
  }

  SetUserLogged(){
    sessionStorage.setItem("sessionUserLogged", "1");      
    this.UserLogged.update(() => 1);
  }

  GetUser(){
    this.LoggedUser.update (() =>  JSON.parse (sessionStorage.getItem("sessionLoggedClient")!));  
    return this.LoggedUser();
  }

  SetUser(user: TypeUser){
    sessionStorage.setItem("sessionLoggedClient", JSON.stringify(user));      
    this.LoggedUser.update(() => user);
  }

  GetCompany(){
    this.SelectedCompany.update (() =>  JSON.parse (sessionStorage.getItem("sessionSelectedCompany")!)) ;  
    return this.SelectedCompany();
  }

  SetCompany(comp: TypeCompanies){
    sessionStorage.setItem("sessionSelectedCompany", JSON.stringify(comp));      
    this.SelectedCompany.update(()=> comp);
  }

  sendCompUpdate(Comp: TypeCompanies) { //the component that wants to update something, calls this fn
    this.subjectName.next(Comp); //next() will feed the value in Subject
  }

  getCompUpdate(): Observable<TypeCompanies> { //the receiver component calls this function 
      return this.subjectName.asObservable(); //it returns as an observable to which the receiver funtion will subscribe
  }

  GetAppSetup(){
    this.AppSetup.update (() =>  JSON.parse (sessionStorage.getItem("sessionAppSetup")!)) ;  
    return this.AppSetup();
  }

  SetAppSetup(Stp: TypeAppSetup){
    sessionStorage.setItem("sessionAppSetup", JSON.stringify(Stp));      
    this.AppSetup.update(()=> Stp);
  }
}
