import { Component } from '@angular/core';
import { CompaniesComponent } from '../Settings/companies/companies.component';
import { MatDialog } from '@angular/material/dialog';
import { SessionStorageService } from '../../session-storage.service';

@Component({
    selector: 'app-indexpage',
    imports: [],
    templateUrl: './indexpage.component.html',
    styleUrl: './indexpage.component.scss'
})
export class IndexpageComponent {

  constructor(private dialog: MatDialog, private sessionService: SessionStorageService) {}

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
  
}
}
