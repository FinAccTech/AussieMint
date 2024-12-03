import { Component, Inject } from '@angular/core';
import { AutoUnsubscribe } from '../../../auto-unsubscribe.decorator';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GlobalsService } from '../../../global.service';
import { Router } from '@angular/router';
import { TypeCompanies } from '../../../Types/TypeCompanies';
import { CompanyService } from '../../Services/companies.service';
import { SessionStorageService } from '../../../session-storage.service';
import { IntToDatePipe } from '../../../Pipes/int-to-date.pipe';
import { CommonModule } from '@angular/common';
import { CompanyComponent } from './company/company.component';
import { AppSetupService } from '../../Services/appsetup.service';

@Component({
    selector: 'app-companies',
    imports: [CommonModule, IntToDatePipe],
    templateUrl: './companies.component.html',
    styleUrl: './companies.component.scss'
})

@AutoUnsubscribe
export class CompaniesComponent {
  constructor( private dialog: MatDialog,public dialogRef: MatDialogRef<CompaniesComponent>, private globals: GlobalsService,              
    @Inject(MAT_DIALOG_DATA) public data: any, private router: Router, private compService: CompanyService, 
    private sessionService: SessionStorageService, private appSetupService: AppSetupService) {}

  CompaniesList: TypeCompanies[]  = [];

  ngOnInit(): void{    
    this.LoadCompaniesList();
  }

  LoadCompaniesList(){    
    this.compService.getCompanies(this.sessionService.GetUser().UserSno).subscribe(data =>{              
      this.CompaniesList = JSON.parse (data.apiData);      
    })    
  }

  SelectCompany(comp: TypeCompanies){ 
    if (comp){
      this.appSetupService.getAppSetup(0, comp.CompSno).subscribe(data=>{        
          if (data.queryStatus == 0){
            this.globals.SnackBar("error","Error getting Transaction Setup details", 1000);
            return;
          }
          else{
            this.sessionService.SetCompany(comp);
            this.sessionService.sendCompUpdate(comp);
            this.sessionService.SetAppSetup(JSON.parse(data.apiData)[0]);
            this.globals.SnackBar("info", "Company changed successfully !!",2000);    
            this.router.navigate(['dashboard']);  
            this.dialogRef.close();             
          } 
      })      
    }
  }

  AddNewCompany(){
    if (this.sessionService.GetUser().UserSno !== 1){
      this.globals.SnackBar("error","You are not authorized to Create Companies", 2000);
      return;
    }    
    this.OpenCompany(this.compService.Initialize());    
  }


  OpenCompany(comp: TypeCompanies){        
    const dialogRef = this.dialog.open(CompanyComponent, 
      {
        data: comp,              
        panelClass:['dialogMat']
      });      
      dialogRef.disableClose = true; 
      dialogRef.afterClosed().subscribe(result => {        
        
        if (result) 
        { 
          if (result == true)
          {
            this.LoadCompaniesList();
          }          
        }        
      });  
  } 
}
