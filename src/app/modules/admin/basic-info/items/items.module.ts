import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemsComponent } from './items.component';
import { Route, RouterModule } from '@angular/router';

const itemsRoutes: Route[] = [
    {
        path     : '',
        component: ItemsComponent
    }
];

@NgModule({
  declarations: [
    ItemsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(itemsRoutes)
  ]
})
export class ItemsModule { }
