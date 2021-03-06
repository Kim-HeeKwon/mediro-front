import {NgModule} from '@angular/core';
import {AccountComponent} from '../account/account.component';
import {CommonModule} from '@angular/common';
import {Route, RouterModule} from '@angular/router';
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
import {MatDialogModule} from '@angular/material/dialog';
import {MatSidenavModule} from '@angular/material/sidenav';
import {SharedModule} from '../../../../shared/shared.module';
import {FuseFindByKeyPipeModule} from '../../../../../@teamplat/pipes/find-by-key';
import {FuseAlertModule} from '../../../../../@teamplat/components/alert';
import {FuseUserHelpModule} from '../../../../../@teamplat/components/user-help';
import {AccountResolver} from '../account/account.resolvers';
import {NewAccountComponent} from './new-account/new-account.component';
import {DetailAccountComponent} from './detail-account/detail-account.component';
import {CommonLoadingBarModule} from '../../../../../@teamplat/components/common-loding-bar/common-loading-bar.module';
import {EtcAccountComponent} from "./etc-account/etc-account.component";

const accountRoutes: Route[] = [
    {
        path     : '',
        component: AccountComponent,
        resolve  : {
            data: AccountResolver
        }
    }
];

@NgModule({
    declarations: [
        AccountComponent,
        NewAccountComponent,
        EtcAccountComponent,
        DetailAccountComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(accountRoutes),
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
        MatDialogModule,
        MatSidenavModule,
        SharedModule,
        FuseFindByKeyPipeModule,
        FuseAlertModule,
        FuseUserHelpModule,
        CommonLoadingBarModule,
    ]
})
export class AccountModule { }
