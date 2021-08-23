import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { FuseDateRangeComponent } from '@teamplat/components/date-range/date-range.component';
import {MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MatButtonToggleModule} from "@angular/material/button-toggle";

export const MY_FORMATS = {
    display: {
        dateInput: 'YYYY/MM/DD',
        monthYearLabel: 'MMM YYYY',
    }
}

@NgModule({
    declarations: [
        FuseDateRangeComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatMomentDateModule,
        MatButtonToggleModule
    ],
    exports     : [
        FuseDateRangeComponent
    ],
    providers: [ {provide:MAT_DATE_LOCALE, useValue:'ko-KR'},
                 {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS}
    ],
})
export class FuseDateRangeModule
{
}
