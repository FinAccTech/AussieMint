import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { Observable } from 'rxjs';
import { TypeHttpResponse } from '../../Types/TypeHttpResponse';
import { TypeUser, TypeUserRights } from '../../Types/TypeUser';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private dataService: DataService) { }

  CheckUserandgetCompanies(UserName: string, Password: string):Observable<TypeHttpResponse>{
    let postdata ={ "UserName" :  UserName, "Password": Password }; 
    return this.dataService.HttpGet(postdata, "/CheckUserandgetCompanies");                
  }
  getUsers(UserSno: number): Observable<TypeHttpResponse> {
    let postdata ={ "UserSno" :  UserSno }; 
    return this.dataService.HttpGet(postdata, "/getUsers");                
  } 

  saveUser(user: TypeUser): Observable<TypeHttpResponse> {    
      let postdata = user;
      return this.dataService.HttpPost(postdata, "/saveUser");                
  }

  deleteUser(UserSno: number): Observable<TypeHttpResponse> {
      let postdata ={ "UserSno" :  UserSno }; 
      return this.dataService.HttpPost(postdata, "/deleteUser");                
  }

Initialize(){
    let User: TypeUser = {            
        UserSno:0,
        UserName: "",
        Password: "",           
        User_Type:0,            
        Active_Status: 1,            
        Rights_Json: "",
        Rights_List: [],
        UserRightsXml: "",            
        Comp_Rights_Json: "",
        Comp_Rights_List: [],
        CompRightsXml: "",
        Profile_Image: "",   
        Image_Name: "",  
        fileSource: {"Image_File":null!, "Image_Name":"", "Image_Url":"","DelStatus":0,"SrcType":0},        
        Enable_WorkingHours: 0,
        FromTime: "",
        ToTime: ""
    }
    return User
}

GetDefaultRightList(){
    let UserRights: TypeUserRights[] = 
    [            
        { FormSno: 1, Form_Name: "Loans", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 2, Form_Name: "Receipts", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 3, Form_Name: "Redemptions", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 4, Form_Name: "Auctions", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 5, Form_Name: "ReLoan", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 6, Form_Name: "OpeningLoan", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 7, Form_Name: "OpeningReceipt", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},

        { FormSno: 8, Form_Name: "ItemGroups", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 9, Form_Name: "Items", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 10, Form_Name: "Customers", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 11, Form_Name: "Suppliers", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 12, Form_Name: "Purity", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 13, Form_Name: "Areas", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 14, Form_Name: "Schemes", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 15, Form_Name: "Locations", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},

        { FormSno: 16, Form_Name: "Repledge", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 17, Form_Name: "RpPayments", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 18, Form_Name: "RpRedemption", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},

        { FormSno: 19, Form_Name: "LoanSummary", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},            
        { FormSno: 20, Form_Name: "PartyHistory", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 21, Form_Name: "LoanHistory", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 22, Form_Name: "AuctionHistory", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 23, Form_Name: "PendingReport", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},

        { FormSno: 24, Form_Name: "LedgerGroups", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 25, Form_Name: "Ledgers", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 26, Form_Name: "Vouchers", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},

        { FormSno: 27, Form_Name: "DayBook", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 28, Form_Name: "GroupSummary", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 29, Form_Name: "TrialBalance", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 30, Form_Name: "ProfitandLoss", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 31, Form_Name: "BalanceSheet", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},
        { FormSno: 32, Form_Name: "DayHistory", View_Right: false,  Edit_Right: false,  Print_Right: false,  Delete_Right: false, Create_Right: false, Report_Right: false,  Date_Access: false, Search_Access: false},

    ];

    return UserRights;
}


}

