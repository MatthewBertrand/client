import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DealsComponent } from './deals/deals.component';
import { AdminComponent } from './admin/admin.component';

export const routes: Routes = 
[
    { path: "home", component: HomeComponent },
    { path: '', component: HomeComponent },
    { path: "deals", component: DealsComponent},
    { path: "admin", component: AdminComponent}
];
