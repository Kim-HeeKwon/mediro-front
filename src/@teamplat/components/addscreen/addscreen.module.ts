import {NgModule} from "@angular/core";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {FuseAddscreenComponent} from "./addscreen.component";
import {MatMenuModule} from "@angular/material/menu";
import {CommonModule} from "@angular/common";
import {MatDividerModule} from "@angular/material/divider";
import {SharedModule} from "../../../app/shared/shared.module";

@NgModule({
    declarations: [
        FuseAddscreenComponent
    ],
    imports: [
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        SharedModule
    ],
    exports     : [
        FuseAddscreenComponent
    ]
})
export class FuseAddscreenModule
{
}
