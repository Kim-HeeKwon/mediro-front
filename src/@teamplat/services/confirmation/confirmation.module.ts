import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TeamPlatConfirmationService } from '@teamplat/services/confirmation/confirmation.service';
import { TeamPlatConfirmationDialogComponent } from '@teamplat/services/confirmation/dialog/dialog.component';
import { CommonModule } from '@angular/common';
import {CommonLoadingBarModule} from "../../components/common-loding-bar/common-loading-bar.module";

@NgModule({
    declarations: [
        TeamPlatConfirmationDialogComponent
    ],
    imports: [
        MatButtonModule,
        MatDialogModule,
        MatIconModule,
        CommonModule,
        CommonLoadingBarModule
    ],
    providers   : [
        TeamPlatConfirmationService
    ]
})
export class TeamPlatConfirmationModule
{
    /**
     * Constructor
     */
    constructor(private _teamplatConfirmationService: TeamPlatConfirmationService)
    {
    }
}
