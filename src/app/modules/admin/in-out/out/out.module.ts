import {NgModule} from '@angular/core';
import {Route, RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {OutComponent} from './out.component';
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
import {outboxRoutes} from "./out.routing";
import {InHeaderComponent} from "../in/in-header/in-header.component";
import {InDetailComponent} from "../in/in-detail/in-detail.component";
import {OutHeaderComponent} from "./out-header/out-header.component";
import {OutDetailComponent} from "./out-detail/out-detail.component";
import {MatSidenavModule} from "@angular/material/sidenav";
import {FuseScrollbarModule} from "../../../../../@teamplat/directives/scrollbar";
import {AngularSplitModule} from "angular-split";
import {FuseScrollResetModule} from "../../../../../@teamplat/directives/scroll-reset";
import {MatDialogModule} from "@angular/material/dialog";
import {OutNewComponent} from "./out-new/out-new.component";
import {MatTabsModule} from "@angular/material/tabs";

@NgModule({
    declarations: [
        OutComponent,
        OutHeaderComponent,
        OutDetailComponent,
        OutNewComponent,
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(outboxRoutes),
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
export class OutModule {
}
