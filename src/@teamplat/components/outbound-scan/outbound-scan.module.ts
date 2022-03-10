import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatMomentDateModule} from "@angular/material-moment-adapter";
import {MatRippleModule} from "@angular/material/core";
import {MatSortModule} from "@angular/material/sort";
import {MatSelectModule} from "@angular/material/select";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatTableModule} from "@angular/material/table";
import {MatDialogModule} from "@angular/material/dialog";
import {SharedModule} from "../../../app/shared/shared.module";
import {FuseFindByKeyPipeModule} from "../../pipes/find-by-key";
import {FuseColumnResizeModule} from "../../directives/table/column-resize";
import {OutboundScanComponent} from "./outbound-scan.component";
import {AngularSplitModule} from "angular-split";
import {FuseAlertModule} from "../alert";

@NgModule({
    declarations: [
        OutboundScanComponent
    ],
    imports: [
        CommonModule,
        MatButtonModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatMomentDateModule,
        MatRippleModule,
        MatSortModule,
        MatSelectModule,
        MatSlideToggleModule,
        MatTableModule,
        MatDialogModule,
        SharedModule,
        FuseFindByKeyPipeModule,
        FuseColumnResizeModule,
        AngularSplitModule,
        FuseAlertModule,
    ],
    exports     : [
        OutboundScanComponent
    ]
})
export class OutboundScanModule
{
}
