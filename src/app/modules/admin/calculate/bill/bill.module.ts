import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BillComponent } from './bill.component';

const billRoutes: Route[] = [
    {
        path     : '',
        component: BillComponent
    }
];

@NgModule({
  declarations: [
    BillComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(billRoutes)
  ]
})
export class BillModule { }
