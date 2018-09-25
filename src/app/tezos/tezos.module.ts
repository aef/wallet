import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatProgressBarModule,
  MatSelectModule,
  MatSidenavModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatMenuModule,
  // MatCardModule,
  // MatCheckboxModule,
  // MatChipsModule,
  // MatDatepickerModule,
  // MatDialogModule,
  // MatExpansionModule,
  // MatGridListModule,
  // MatPaginatorModule,
  // MatProgressSpinnerModule,
  // MatRadioModule,
  // MatSliderModule,
  // MatSlideToggleModule,
  // MatSnackBarModule,
  // MatSortModule,
  // MatStepperModule,
} from '@angular/material';

import { RouterModule } from '@angular/router';
import { TezosRouting } from './tezos.routing';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { reducers } from './tezos.reducers';

import { TezosEffects } from './tezos.effects'
import { TezosWalletListEffects } from './tezos-wallet/tezos-wallet-list/tezos-wallet-list.effect'

import { TezosNodeComponent } from './tezos-node/tezos-node.component';
import { TezosWalletComponent } from './tezos-wallet/tezos-wallet.component';
import { TezosWalletListComponent } from './tezos-wallet/tezos-wallet-list/tezos-wallet-list.component';


@NgModule({
  imports: [
    CommonModule,

    RouterModule.forChild(TezosRouting),

    StoreModule.forFeature('tezos', reducers),

    EffectsModule.forFeature([
      TezosEffects,
      TezosWalletListEffects,
    ]),

    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatTableModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
    // MatCardModule,
    // MatCheckboxModule,
    // MatChipsModule,
    // MatDatepickerModule,
    // MatDialogModule,
    // MatExpansionModule,
    // MatGridListModule,
    // MatPaginatorModule,
    // MatProgressSpinnerModule,
    // MatRadioModule,
    // MatSelectModule,
    // MatSlideToggleModule,
    // MatSliderModule,
    // MatSnackBarModule,
    // MatSortModule,
    // MatStepperModule,

  ],
  declarations: [
    TezosNodeComponent,
    TezosWalletComponent,
    TezosWalletListComponent
  ]
})
export class TezosModule { }
