import {
  ActionReducerMap,
  ActionReducer,
  MetaReducer,
} from '@ngrx/store';
import { environment } from '../environments/environment';
import { RouterStateUrl } from './app.routing';
import * as fromRouter from '@ngrx/router-store';
import { storeLogger } from 'ngrx-store-logger';


/**
 * storeFreeze prevents state from being mutated. When mutation occurs, an
 * exception will be thrown. This is useful during development mode to
 * ensure that none of the reducers accidentally mutates the state.
 */
import { storeFreeze } from 'ngrx-store-freeze';

/**
 * Every reducer module's default export is the reducer function itself. In
 * addition, each module should export a type or interface that describes
 * the state of the reducer plus any selector functions. The `* as`
 * notation packages up all of the exports into a single object.
 */

import * as fromApp from './app.reducer';
import * as fromAuthLogin from './auth/login/login.reducer';
import * as fromAuthRegistration from './auth/registration/registration.reducer';
import * as fromAuthForgot from './auth/forgot/forgot.reducer';
import * as fromLandingTezosHardwareWallet from './landing/tezos-hardware-wallet/tezos-hardware-wallet.reducer';

// meta reducert for dynamic forms
import * as fromNgrxForm from './shared/ngrx-form.reducer';

/**
 * As mentioned, we treat each reducer like a table in a database. This means
 * our top level state interface is just a map of keys to inner state types.
 */
export interface State {
  app: any;

  authLogin: any;
  authRegistration: any;
  authForgot: any;

  landingTezosHardwareWallet: any;
  routerReducer: fromRouter.RouterReducerState<RouterStateUrl>;
}

/**
 * Our state is composed of a map of action reducer functions.
 * These reducer functions are called with each dispatched action
 * and the current or initial state and return a new immutable state.
 */
export const reducers: ActionReducerMap<State> = {
  app: fromApp.reducer,
  
  authLogin: fromAuthLogin.reducer,
  authRegistration: fromAuthRegistration.reducer,
  authForgot: fromAuthForgot.reducer,
  
  landingTezosHardwareWallet: fromLandingTezosHardwareWallet.reducer,
  routerReducer: fromRouter.routerReducer,
};

// console.log all actions
export function logger(reducer: ActionReducer<State>): any {
  // default, no options
  return storeLogger()(reducer);
}

/**
 * By default, @ngrx/store uses combineReducers with the reducer map to compose
 * the root meta-reducer. To add more meta-reducers, provide an array of meta-reducers
 * that will be composed to form the root meta-reducer.
 */
export const metaReducers: MetaReducer<State>[] = !environment.production
  ? [fromNgrxForm.form, storeFreeze]
  : [fromNgrxForm.form, logger];




