import { Injectable } from '@angular/core';
import {CommonAlertConfig} from './common-alert-config';
import {CommonAlertComponent} from './common-alert.component';
import {MatDialog, MatDialogConfig, MatDialogRef} from '@angular/material/dialog';

@Injectable()
/**
 * A service used for opening a custom dialog with options specified
 */
export class CommonAlertService {
    constructor(private dialog: MatDialog) {}
    /**
     * Retrieves the default custom dialog config
     * @param dialogType The dialog's type
     * @returns The default custom dialog config
     */
    private _getDefaultCustomDialogConfig(dialogType?: 'alert' | 'confirm'): CommonAlertConfig {
        return {
            dialogTitle: dialogType === 'alert' ? 'Alert' : 'Confirm',
            dialogType: dialogType ? dialogType : 'alert'
        };
    }
    /**
     * Opens an alert dialog
     * @param config Configuration options for the custom dialog
     * @param dialogConfig Configuration options for the internal dialog config
     * @returns The dialog reference of the currently-opened dialog
     */
    openAlertDialog(
        config?: CommonAlertConfig,
        dialogConfig?: MatDialogConfig<CommonAlertConfig>): MatDialogRef<CommonAlertComponent, string> {
        let _config: CommonAlertConfig;
        let _dialogConfig: MatDialogConfig<CommonAlertConfig>;
        if (config) {
            _config = config;
        } else {
            _config = this._getDefaultCustomDialogConfig('alert');
        }

        if (dialogConfig) {
            _dialogConfig = dialogConfig;
            if (_config && !_dialogConfig.data) {
                _dialogConfig.data = _config;
            } else {
                _dialogConfig.data = this._getDefaultCustomDialogConfig('confirm');
            }
        } else {
            _dialogConfig = {
                data: _config
            }
        }
        return this.dialog.open<CommonAlertComponent, CommonAlertConfig, string>(CommonAlertComponent, _dialogConfig);
    }
    /**
     * Opens a confirmation dialog
     * @param config Configuration options for the custom dialog
     * @param dialogConfig Configuration options for the internal dialog config
     * @returns The dialog reference of the currently-opened dialog
     */
    openConfirmDialog(
        config?: CommonAlertConfig,
        dialogConfig?: MatDialogConfig<CommonAlertConfig>): MatDialogRef<CommonAlertComponent, string> {
        let _config: CommonAlertConfig;
        let _dialogConfig: MatDialogConfig<CommonAlertConfig>;
        if (config) {
            _config = config;
        } else {
            _config = this._getDefaultCustomDialogConfig('confirm');
        }

        if (dialogConfig) {
            _dialogConfig = dialogConfig;
            if (_config && !_dialogConfig.data) {
                _dialogConfig.data = _config;
            } else {
                _dialogConfig.data = this._getDefaultCustomDialogConfig('confirm');
            }
        } else {
            _dialogConfig = {
                data: _config
            }
        }
        return this.dialog.open<CommonAlertComponent, CommonAlertConfig, string>(CommonAlertComponent, _dialogConfig);
    }
}
