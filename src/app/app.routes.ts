import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './Dashboard/dashboard/dashboard.component';
import { NgModule } from '@angular/core';
import { LoginComponent } from './Auth/login/login.component';
import { AuthGuard } from './Auth/login/auth.guard';
import { IndexpageComponent } from './Dashboard/indexpage/indexpage.component';
import { ItemgroupsComponent } from './Dashboard/Masters/itemgroups/itemgroups.component';
import { ItemsComponent } from './Dashboard/Masters/items/items.component';
import { UomsComponent } from './Dashboard/Masters/uoms/uoms.component';
import { ClientsComponent } from './Dashboard/Masters/clients/clients.component';
import { VoucherserieslistComponent } from './Dashboard/Settings/voucherserieslist/voucherserieslist.component';
import { TransactionsComponent } from './Dashboard/transactions/transactions.component';
import { TransactionComponent } from './Dashboard/transactions/transaction/transaction.component';
import { PendingdocsComponent } from './Dashboard/Reports/pendingdocs/pendingdocs.component';
import { StockreportComponent } from './Dashboard/Reports/stockreport/stockreport.component';
import { LedgergroupsComponent } from './Dashboard/Accounts/ledgergroups/ledgergroups.component';
import { LedgersComponent } from './Dashboard/Accounts/ledgers/ledgers.component';
import { PendinglabreportComponent } from './Dashboard/Reports/pendinglabreport/pendinglabreport.component';
import { ClienthistoryComponent } from './Dashboard/Reports/clienthistory/clienthistory.component';
import { DaybookComponent } from './Dashboard/Accounts/daybook/daybook.component';
import { LedgerbookComponent } from './Dashboard/Accounts/ledgerbook/ledgerbook.component';
import { VougeneralsComponent } from './Dashboard/Accounts/vougenerals/vougenerals.component';
import { PrintsetupComponent } from './Dashboard/Settings/printsetup/printsetup.component';
import { BarCodeStockreportComponent } from './Dashboard/Reports/barcodestockreport/barcodestockreport.component';
import { WeeklyconsolidatedComponent } from './Dashboard/Reports/weeklyconsolidated/weeklyconsolidated.component';
import { BarcodeitemshistoryComponent } from './Dashboard/Reports/barcodeitemshistory/barcodeitemshistory.component';
import { CompaniesComponent } from './Dashboard/Settings/companies/companies.component';


export const routes: Routes = [
    { path:'', component: LoginComponent}, 
    { path:'dashboard', component: DashboardComponent,canActivate: [AuthGuard],
        children:[
            { path:'', component: IndexpageComponent},
            { path:'companies', component: CompaniesComponent},
            { path:'itemgroups', component: ItemgroupsComponent},
            { path:'items', component: ItemsComponent},
            { path:'uoms', component: UomsComponent},
            { path:'clients', component: ClientsComponent},

            { path:'transactions/:voutypesno', component: TransactionsComponent},
            { path:'transaction', component: TransactionComponent},

            { path:'clienthistory', component: ClienthistoryComponent},
            { path:'pendingdocuments', component: PendingdocsComponent},
            { path:'stockreport', component: StockreportComponent},                        
            { path:'barcodedstockreport', component: BarCodeStockreportComponent},     
            { path:'labreports', component: PendinglabreportComponent},
            { path:'weeklyconsolidated', component: WeeklyconsolidatedComponent},
            { path:'barcodeditemhistory', component: BarcodeitemshistoryComponent},

            { path:'ledgergroups', component: LedgergroupsComponent},
            { path:'ledgers', component: LedgersComponent},
            { path:'daybook', component: DaybookComponent},
            { path:'ledgerbook', component: LedgerbookComponent},
            { path:'vouchers', component: VougeneralsComponent},

            { path:'voucherseries', component: VoucherserieslistComponent},

            { path:'printsetup', component: PrintsetupComponent},
            
        ]
    }
];

// @NgModule({  
//     imports: [RouterModule.forRoot(routes, { useHash: true })],
//     exports: [RouterModule],
//     providers: [],
    
//   })

  export class AppRoutingModule { 
  
  }
  
  