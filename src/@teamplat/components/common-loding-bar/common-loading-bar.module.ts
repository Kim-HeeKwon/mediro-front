import {NgModule} from '@angular/core';
import {SatPopoverModule} from '@ncstate/sat-popover';
import {FuseUserHelpComponent, FuseUserHelpModule} from "../user-help";
import {CommonLoadingBarComponent} from "./common-loading-bar.component";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatMenuModule} from "@angular/material/menu";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatMomentDateModule} from "@angular/material-moment-adapter";
import {MatRippleModule} from "@angular/material/core";
import {MatSortModule} from "@angular/material/sort";
import {MatSelectModule} from "@angular/material/select";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTableModule} from "@angular/material/table";
import {MatTooltipModule} from "@angular/material/tooltip";
import {SharedModule} from "../../../app/shared/shared.module";
import {FuseFindByKeyPipeModule} from "../../pipes/find-by-key";
import {FuseAlertModule} from "../alert";
import {MatCardModule} from "@angular/material/card";
import {MatTabsModule} from "@angular/material/tabs";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatDialogModule} from "@angular/material/dialog";
import {FuseDateRangeModule} from "../date-range";

@NgModule({
    declarations: [
        CommonLoadingBarComponent
    ],
    imports: [
        CommonModule,
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
        MatCardModule,
        MatTabsModule,
        MatSidenavModule,
        MatDialogModule,
        FuseDateRangeModule,
        FuseUserHelpModule,
        SatPopoverModule ],
    exports     : [
        CommonLoadingBarComponent
    ],
    providers: [
        CommonLoadingBarComponent
    ],
})

export class CommonLoadingBarModule {

}

