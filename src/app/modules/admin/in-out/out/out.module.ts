import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OutComponent } from './out.component';

const outRoutes: Route[] = [
    {
        path     : '',
        component: OutComponent
    }
];

@NgModule({
  declarations: [
    OutComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(outRoutes)
  ]
})
export class OutModule { }
