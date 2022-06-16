import {NgModule} from "@angular/core";
import {DashboardsColorChangeComponent} from "./dashboards-color-change.component";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {SharedModule} from "../../../app/shared/shared.module";
import {MatTooltipModule} from "@angular/material/tooltip";

@NgModule({
    declarations: [
        DashboardsColorChangeComponent
    ],
    imports:  [
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        SharedModule,
        MatTooltipModule
    ],
    exports: [
        DashboardsColorChangeComponent
    ]
})
export class DashboardsColorChangeModule {

}
