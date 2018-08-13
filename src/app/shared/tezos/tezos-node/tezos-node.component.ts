import { Input, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms'
import { Store } from '@ngrx/store'
import { Subject, of } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';


@Component({
  selector: 'app-tezos-node',
  templateUrl: './tezos-node.component.html',
  styleUrls: ['./tezos-node.component.scss']
})
export class TezosNodeComponent implements OnInit {

  public tezosNode
  public destroy$ = new Subject<null>();

  constructor(
    public store: Store<any>,
    public fb: FormBuilder,
  ) { }

  ngOnInit() {

    // listen to tezos node list
    this.store.select('tezosNode')
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.tezosNode = state
      })

  }

  changeNode(node) {
    // change tezos node 
    this.store.dispatch({
      type: 'TEZOS_NODE_CHANGE',
      payload: node,
    })
  }
  
}
