import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EstimateComponent } from './estimate.component';

const estimateRoutes: Route[] = [
    {
        path     : '',
        component: EstimateComponent
    }
];

@NgModule({
  declarations: [
    EstimateComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(estimateRoutes)
  ]
})
export class EstimateModule { }
