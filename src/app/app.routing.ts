import { Routes } from '@angular/router'
import { RouterStateSnapshot, Params } from '@angular/router';
import { RouterStateSerializer } from '@ngrx/router-store';

import { LoginComponent } from './auth/login/login.component';
import { RegistrationComponent } from './auth/registration/registration.component';
import { ForgotComponent } from './auth/forgot/forgot.component';

import { AccountComponent } from './account/account.component';
import { AccountNewComponent } from './account/account-new/account-new.component';
import { AccountDetailComponent } from './account/account-detail/account-detail.component';

import { TransactionComponent } from './transaction/transaction.component';
import { DelegateComponent } from './delegate/delegate.component';
import { SettingsComponent } from './settings/settings.component';
import { TrezorComponent } from './trezor/trezor.component';

import { LandingComponent } from './landing/landing.component';
import { SignupComponent } from './landing/signup/signup.component';

export const AppRouting: Routes = [
  // { path: 'balance', component: BalanceComponent },
  { path: 'accounts', component: AccountComponent },
  { path: 'accounts/new', component: AccountNewComponent },
  { path: 'account/:id', component: AccountDetailComponent },
  // { path: 'transactions', component: TransactionComponent },
  // { path: 'settings', component: SettingsComponent },
  { path: 'delegates', component: DelegateComponent },  
  { path: 'trezor', component: TrezorComponent },

  { path: 'landing', component: LandingComponent },  
  { path: 'landing/signup', component: SignupComponent },  

  
  { path: 'login', component: LoginComponent },    
  { path: 'registration', component: RegistrationComponent },    
  { path: 'forgot', component: ForgotComponent },    

  { path: '', redirectTo: '/landing/signup', pathMatch: 'full' },
  //{ path: '**', component: PageNotFoundComponent }
];

/**
 * The RouterStateSerializer takes the current RouterStateSnapshot
 * and returns any pertinent information needed. The snapshot contains
 * all information about the state of the router at the given point in time.
 * The entire snapshot is complex and not always needed. In this case, you only
 * need the URL and query parameters from the snapshot in the store. Other items could be
 * returned such as route parameters and static route data.
 */

export interface RouterStateUrl {
  url: string;
  queryParams: Params;
}

export class CustomRouterStateSerializer
  implements RouterStateSerializer<RouterStateUrl> {
  serialize(routerState: RouterStateSnapshot): RouterStateUrl {
    const { url } = routerState;
    const queryParams = routerState.root.queryParams;

    return { url, queryParams };
  }
}