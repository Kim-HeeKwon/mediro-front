import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderComponent } from './order.component';

const orderRoutes: Route[] = [
    {
        path     : '',
        component: OrderComponent
    }
];

@NgModule({
  declarations: [
    OrderComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(orderRoutes)
  ]
})
export class OrderModule { }
