import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
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
import {MatDividerModule} from '@angular/material/divider';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSidenavModule} from '@angular/material/sidenav';
import {InHeaderComponent} from './in-header/in-header.component';
import {InDetailComponent} from './in-detail/in-detail.component';
import {InComponent} from './in.component';
import {inboxRoutes} from './in.routing';
import { FuseScrollbarModule } from '@teamplat/directives/scrollbar';
import { FuseScrollResetModule } from '@teamplat/directives/scroll-reset';
import { AngularSplitModule } from 'angular-split';
import {MatTabsModule} from "@angular/material/tabs";
import {InNewComponent} from "./in-new/in-new.component";

@NgModule({
    declarations: [
        InComponent,
        InHeaderComponent,
        InDetailComponent,
        InNewComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(inboxRoutes),
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
        MatSidenavModule,
        FuseScrollbarModule,
        FuseScrollResetModule,
        AngularSplitModule,
        MatDialogModule,
        MatTabsModule,
    ]
})
export class InModule {
}
