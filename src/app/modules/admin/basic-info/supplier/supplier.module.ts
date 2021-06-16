import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupplierComponent } from './supplier.component';
import { Route, RouterModule } from '@angular/router';

const supplierRoutes: Route[] = [
    {
        path     : '',
        component: SupplierComponent
    }
];

@NgModule({
  declarations: [
    SupplierComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(supplierRoutes)
  ]
})
export class SupplierModule { }
