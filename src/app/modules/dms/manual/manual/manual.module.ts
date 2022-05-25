import {NgModule} from '@angular/core';
import {Route, RouterModule} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTableModule} from "@angular/material/table";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatDialogModule} from "@angular/material/dialog";
import {manualComponent} from "./manual.component";
import {CommonModule} from "@angular/common";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatMenuModule} from "@angular/material/menu";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatMomentDateModule} from "@angular/material-moment-adapter";
import {MatRippleModule} from "@angular/material/core";
import {MatSortModule} from "@angular/material/sort";
import {SharedModule} from "../../../../shared/shared.module";
import {FuseUserHelpModule} from "../../../../../@teamplat/components/user-help";
import {CommonLoadingBarModule} from "../../../../../@teamplat/components/common-loding-bar/common-loading-bar.module";
import {basicInfoManualComponent} from "../basicInfo-manual/basicInfo-Manual.component";
import {circulationManualComponent} from "../circulation-manual/circulation-Manual.component";
import {udiManualComponent} from "../udi-manual/udi-Manual.component";
import {smartPlusManualComponent} from "../smartPlus-manual/smartPlus-Manual.component";
import {etcManualComponent} from "../etc-manual/etc-Manual.component";
import {calculateManualComponent} from "../calculate-manual/calculate-Manual.component";
import {newSignupManualComponent} from "../newSigup/newSignup-Manual.component";


const manualsRoutes: Route[] = [
    {
        path     : '',
        component: manualComponent
    }
];
@NgModule({
    declarations: [
        manualComponent,
        basicInfoManualComponent,
        circulationManualComponent,
        udiManualComponent,
        smartPlusManualComponent,
        etcManualComponent,
        circulationManualComponent,
        calculateManualComponent,
        newSignupManualComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(manualsRoutes),
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
        MatSidenavModule,
        MatDialogModule,
        SharedModule,
        FuseUserHelpModule,
        CommonLoadingBarModule
    ]
})
export class ManualModule
{
}
