import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StockComponent } from './stock.component';

const stockRoutes: Route[] = [
    {
        path     : '',
        component: StockComponent
    }
];

@NgModule({
  declarations: [
    StockComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(stockRoutes)
  ]
})
export class StockModule { }
