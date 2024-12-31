import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReportService } from '../Services/reports.service';
import { GlobalsService } from '../../global.service';
import { ClientService, TypeClient } from '../Services/client.service';
import { FormsModule } from '@angular/forms';
import { SearchPipe } from "../../Pipes/search.pipe";
import { CompaniesComponent } from '../Settings/companies/companies.component';
import { SessionStorageService } from '../../session-storage.service';
import { ClientprofileComponent } from '../Widgets/clientprofile/clientprofile.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-indexpage',
    imports: [FormsModule, SearchPipe],
    templateUrl: './indexpage.component.html',
    styleUrl: './indexpage.component.scss'
})
export class IndexpageComponent {

constructor(private dialog: MatDialog, 
  private sessionService: SessionStorageService, 
  private clntService: ClientService, 
  private repService: ReportService, 
  private globals: GlobalsService,
  private router: Router
) {}
rTransList: any[] = [];
ClientList: TypeClient[] = [];
searchText: string = "";

ngOnInit(){
  if (!this.sessionService.GetCompany()){      
    const dialogRef = this.dialog.open(CompaniesComponent,   
      {        
        data: "",         
        panelClass:['dialogMat']
      });      
      //dialogRef.disableClose = true;  
      dialogRef.afterClosed().subscribe(result => {             
      }); 
  }      
  this.repService.getRecentTransactions(10).subscribe(data=>{        
    this.rTransList = JSON.parse(data.apiData);     
  })
  this.clntService.getClients(0).subscribe(data=>{
    this.ClientList = JSON.parse(data.apiData);
  })

}

GetVouTypeName(VouTypeSno: number): string {
  return this.globals.GetVouTypeName(VouTypeSno);
}

getFirstLetters(VouTypeSno: number): string {
  return this.globals.GetVouTypeName(VouTypeSno)
    .split(' ') // Split the string into words
    .map(word => word.charAt(0)) // Get the first letter of each word
    .join(''); // Combine the letters into a single string
}

OpenClientProfile(clnt: TypeClient){      
  const dialogRef = this.dialog.open(ClientprofileComponent,   
    {        
      data: clnt,        
      maxWidth: 'none' ,
      minWidth: '30vw'
      
    });      
    //dialogRef.disableClose = true;  
    dialogRef.afterClosed().subscribe(result => {             
    });   
}

OpenDocument(VouTypeSno: number){
  this.router.navigate(['dashboard/transactions/'+VouTypeSno]);
}

}
 