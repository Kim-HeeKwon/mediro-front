import {Route, RouterModule} from '@angular/router';
import {ItemPriceResolvers} from './item-price.resolvers';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
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
import {FuseAlertModule} from '../../../../../@teamplat/components/alert';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatDialogModule} from '@angular/material/dialog';
import {ItemPriceComponent} from './item-price.component';
import {ItemPriceNewComponent} from './item-price-new/item-price-new.component';
import {ItemPriceHistoryComponent} from './item-price-history/item-price-history.component';
import {ItemPriceHistoryResolvers} from './item-price-history/item-price-history.resolvers';
import {FuseUserHelpModule} from "../../../../../@teamplat/components/user-help";
import {CommonLoadingBarModule} from "../../../../../@teamplat/components/common-loding-bar/common-loading-bar.module";

const itemPriceRoutes: Route[] = [
    {
        path: '',
        component: ItemPriceComponent,
        resolve: {
            data: ItemPriceResolvers
        },
        children             : [
            {
                path     : '',
                component: ItemPriceHistoryComponent,
                resolve : {
                    data: ItemPriceHistoryResolvers
                }
            }
        ]
    }
];
@NgModule({
    declarations: [
        ItemPriceComponent,
        ItemPriceNewComponent,
        ItemPriceHistoryComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(itemPriceRoutes),
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
        MatDialogModule,
        FuseUserHelpModule,
        CommonLoadingBarModule
    ]
})
export class ItemPriceModule { }
