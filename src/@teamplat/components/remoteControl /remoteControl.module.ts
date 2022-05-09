import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatDividerModule} from "@angular/material/divider";
import {SharedModule} from "../../../app/shared/shared.module";
import {RemoteControlComponent} from "./remoteControl.component";
import {MatTooltipModule} from "@angular/material/tooltip";

@NgModule({
    declarations: [
        RemoteControlComponent
    ],
    imports: [
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        SharedModule,
        MatTooltipModule
    ],
    exports     : [
        RemoteControlComponent
    ]
})
export class RemoteControlModule
{
}
