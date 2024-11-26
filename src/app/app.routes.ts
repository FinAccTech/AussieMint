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
import { LedgergroupsComponent } from './Dashboard/Masters/ledgergroups/ledgergroups.component';
import { LedgersComponent } from './Dashboard/Masters/ledgers/ledgers.component';
import { BuyingcontractsComponent } from './Dashboard/Purchase/buyingcontracts/buyingcontracts.component';
import { BuyingcontractComponent } from './Dashboard/Purchase/buyingcontracts/buyingcontract/buyingcontract.component';

export const routes: Routes = [
    { path:'', component: LoginComponent}, 
    { path:'dashboard', component: DashboardComponent,canActivate: [AuthGuard],
        children:[
            { path:'', component: IndexpageComponent},
            { path:'itemgroups', component: ItemgroupsComponent},
            { path:'items', component: ItemsComponent},
            { path:'uoms', component: UomsComponent},
            { path:'clients', component: ClientsComponent},

            { path:'buyingcontracts', component: BuyingcontractsComponent},
            { path:'buyingcontract', component: BuyingcontractComponent},

            { path:'ledgergroups', component: LedgergroupsComponent},
            { path:'ledgers', component: LedgersComponent},

            { path:'voucherseries', component: VoucherserieslistComponent},
            
        ]
    }
];

@NgModule({  
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
    providers: [],
    
  })

  export class AppRoutingModule { 
  
  }
  
  