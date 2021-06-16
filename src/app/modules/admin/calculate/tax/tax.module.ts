import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TaxComponent } from './tax.component';

const taxRoutes: Route[] = [
    {
        path     : '',
        component: TaxComponent
    }
];

@NgModule({
  declarations: [
    TaxComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(taxRoutes)
  ]
})
export class TaxModule { }
