import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { Store } from '@ngrx/store';
import { of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-tezos-trezor-new',
  templateUrl: './tezos-trezor-new.component.html',
  styleUrls: ['./tezos-trezor-new.component.scss']
})
export class TezosTrezorNewComponent implements OnInit {

  public displayedColumns: string[] = ['address', 'path', 'amount', 'operations'];

  private onDestroy$ = new Subject()

  private data
  private dataSource = [
    { address: "tz1Kef7BSg6fo75jk37WkKRYSnJDs69KVqt9", path: "44'/1729'/0'", amount: "123123", operations: "123123" },
  ]

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public store: Store<any>,
  ) { }


  ngOnInit() {

    // wait for data changes from redux    
    this.store.select('tezos', 'tezosTrezorNew')
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(data => {

        //
        this.dataSource = data.ids.map(id => ({ id, ...data.entities[id] }))

        //
        this.data = new MatTableDataSource<any>(this.dataSource);
        this.data.paginator = this.paginator;

      })

  }

  getAddress() {
    this.store.dispatch({
      type: 'TEZOS_TREZOR_NEW'
    })
  }

}