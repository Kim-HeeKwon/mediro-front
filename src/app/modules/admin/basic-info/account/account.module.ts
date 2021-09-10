import { NgModule } from '@angular/core';
import {Route, RouteReuseStrategy, RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import { AccountComponent } from './account.component';
import { AccountResolver } from './account.resolvers';
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
import {NewAccountComponent} from '../account/new-account/new-account.component';
import {FuseAlertModule} from '../../../../../@teamplat/components/alert';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FuseUserHelpModule} from '../../../../../@teamplat/components/user-help';

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
    NewAccountComponent
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
        FuseUserHelpModule
    ]
})
export class AccountModule { }
