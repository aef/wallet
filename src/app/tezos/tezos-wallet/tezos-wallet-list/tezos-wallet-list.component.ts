import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store'
import { of, Subject } from 'rxjs'
import { takeUntil } from 'rxjs/operators'

@Component({
  selector: 'app-tezos-wallet-list',
  templateUrl: './tezos-wallet-list.component.html',
  styleUrls: ['./tezos-wallet-list.component.scss']
})
export class TezosWalletListComponent implements OnInit {

  private tezosWalletList
  private onDestroy$ = new Subject()

  constructor(
    public store: Store<any>,
  ) { }

  ngOnInit() {

    // wait for data changes from redux    
    this.store.select('tezos', 'tezosWalletList')
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(data => {
        this.tezosWalletList = data.ids.map(id => ({ id, ...data.entities[id] }))
      })
  }

}
