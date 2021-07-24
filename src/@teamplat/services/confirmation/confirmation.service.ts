import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { merge } from 'lodash-es';
import { TeamPlatConfirmationDialogComponent } from '@teamplat/services/confirmation/dialog/dialog.component';
import { TeamPlatConfirmationConfig } from '@teamplat/services/confirmation/confirmation.types';

@Injectable()
export class TeamPlatConfirmationService
{
    private _defaultConfig: TeamPlatConfirmationConfig = {
        title      : '확인',
        message    : '확인하겠습니까?',
        icon       : {
            show : true,
            name : 'heroicons_outline:check-circle',
            color: 'primary'
        },
        actions    : {
            confirm: {
                show : true,
                label: 'Confirm',
                color: 'accent'
            },
            cancel : {
                show : true,
                label: 'Cancel'
            }
        },
        dismissible: false
    };

    /**
     * Constructor
     */
    constructor(
        private _matDialog: MatDialog
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    open(config: TeamPlatConfirmationConfig = {}): MatDialogRef<TeamPlatConfirmationDialogComponent>
    {
        const userConfig = merge({}, this._defaultConfig, config);

        return this._matDialog.open(TeamPlatConfirmationDialogComponent, {
            autoFocus   : false,
            disableClose: !userConfig.dismissible,
            data        : userConfig
        });
    }
}
