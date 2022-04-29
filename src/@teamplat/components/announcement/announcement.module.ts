import {NgModule} from "@angular/core";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {MatMenuModule} from "@angular/material/menu";
import {MatDividerModule} from "@angular/material/divider";
import {SharedModule} from "../../../app/shared/shared.module";
import {FuseAnnouncementComponent} from "./announcement.component";

@NgModule({
    declarations: [
        FuseAnnouncementComponent
    ],
    imports: [
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatMenuModule,
        SharedModule
    ],
    exports     : [
        FuseAnnouncementComponent
    ]
})
export class FuseAnnouncementModule
{
}
