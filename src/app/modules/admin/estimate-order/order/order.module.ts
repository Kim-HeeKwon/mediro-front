import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {OrderComponent} from './order.component';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatRippleModule} from '@angular/material/core';
import {MatSortModule} from '@angular/material/sort';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableModule} from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';
import {SharedModule} from '../../../../shared/shared.module';
import {FuseFindByKeyPipeModule} from '../../../../../@teamplat/pipes/find-by-key';
import {OrderDetailComponent} from './order-detail/order-detail.component';
import {OrderDetailResolvers} from './order-detail/order-detail.resolvers';
import {MatTabsModule} from '@angular/material/tabs';
import {OrderNewComponent} from './order-new/order-new.component';
import {OrderNewResolvers} from './order-new/order-new.resolvers';
import {MatDialogModule} from '@angular/material/dialog';
import {MatCardModule} from '@angular/material/card';
import {FuseAlertModule} from '../../../../../@teamplat/components/alert';
import {OrderResolvers} from './order.resolvers';
import {MatSidenavModule} from "@angular/material/sidenav";

const orderRoutes: Route[] = [
    {
        path: '',
        component: OrderComponent,
        resolve  : {
            data: OrderResolvers
        }
    },
    {
        path     : 'order-detail',
        component: OrderDetailComponent,
        resolve  : {
            data: OrderDetailResolvers
        }
    },
    {
        path     : 'order-new',
        component: OrderNewComponent,
        resolve  : {
            data: OrderNewResolvers
        }
    },
];

@NgModule({
    declarations: [
        OrderComponent,
        OrderDetailComponent,
        OrderNewComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(orderRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatDatepickerModule,
        MatMomentDateModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTableModule,
        MatTooltipModule,
        SharedModule,
        FuseFindByKeyPipeModule,
        FuseAlertModule,
        MatTabsModule,
        MatCardModule,
        MatSidenavModule,
        MatDialogModule
    ]
})
export class OrderModule {
}
