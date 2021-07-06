import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CommonPopupComponent} from './common-popup.component';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDialogModule} from '@angular/material/dialog';
import {SharedModule} from '../../../app/shared/shared.module';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatRippleModule} from '@angular/material/core';
import {MatSortModule} from '@angular/material/sort';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableModule} from '@angular/material/table';

@NgModule({
    declarations: [
        CommonPopupComponent
    ],
    imports     : [
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
    ],
    exports     : [
        CommonPopupComponent
    ]
})
export class CommonPopupModule
{
}
