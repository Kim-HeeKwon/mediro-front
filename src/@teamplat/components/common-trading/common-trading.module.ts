import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatMomentDateModule} from '@angular/material-moment-adapter';
import {MatRippleModule} from '@angular/material/core';
import {MatSortModule} from '@angular/material/sort';
import {MatSelectModule} from '@angular/material/select';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTableModule} from '@angular/material/table';
import {MatDialogModule} from '@angular/material/dialog';
import {SharedModule} from '../../../app/shared/shared.module';
import {CommonTradingComponent} from './common-trading.component';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {NgxPrintModule} from "ngx-print";
import {BrowserModule} from "@angular/platform-browser";

@NgModule({
    declarations: [
        CommonTradingComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        NgxDatatableModule,
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
        NgxPrintModule,
        MatDialogModule,
        SharedModule,
    ],
    exports: [
        CommonTradingComponent
    ],
})
export class CommonTradingModule
{
}
