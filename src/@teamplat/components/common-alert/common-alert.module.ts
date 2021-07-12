import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import {CommonAlertService} from './common-alert.service';
import {CommonAlertComponent} from './common-alert.component';

@NgModule({
    imports: [
        BrowserModule,
        CommonModule,
        MatButtonModule,
        MatDialogModule
    ],
    providers: [
        CommonAlertService
    ],
    declarations: [
        CommonAlertComponent
    ],
    exports: [
        CommonAlertComponent
    ],
    entryComponents: [
        CommonAlertComponent
    ]
})
export class MyCustomDialogModule {}
