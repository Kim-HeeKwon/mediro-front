import { ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, HostBinding, Input, OnDestroy, OnInit, Output, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import {ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from '@angular/forms';
import { Overlay } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatCalendarCellCssClasses, MatMonthView } from '@angular/material/datepicker';
import { Subject } from 'rxjs';
import * as moment from 'moment';
import { Moment } from 'moment';
import {DeviceDetectorService} from 'ngx-device-detector';
import {CommonCode, FuseUtilsService} from "../../services/utils";
import {CodeStore} from "../../../app/core/common-code/state/code.store";

@Component({
    selector     : 'fuse-date-range',
    templateUrl  : './date-range.component.html',
    styleUrls    : ['./date-range.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs     : 'fuseDateRange',
    providers    : [
        {
            provide    : NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FuseDateRangeComponent),
            multi      : true
        }
    ]
})
export class FuseDateRangeComponent implements ControlValueAccessor, OnInit, OnDestroy
{
    @Output() readonly rangeChanged: EventEmitter<{ start: string; end: string }> = new EventEmitter<{ start: string; end: string }>();
    @ViewChild('matMonthView1') private _matMonthView1: MatMonthView<any>;
    @ViewChild('matMonthView2') private _matMonthView2: MatMonthView<any>;
    @ViewChild('pickerPanelOrigin', {read: ElementRef}) private _pickerPanelOrigin: ElementRef;
    @ViewChild('pickerPanel') private _pickerPanel: TemplateRef<any>;
    @HostBinding('class.fuse-date-range') private _defaultClassNames = true;
    isMobile: boolean = false;
    activeDates: { month1: Moment | null; month2: Moment | null } = {
        month1: null,
        month2: null
    };
    searchForm: FormGroup;
    year: CommonCode[] = null;
    setWhichDate: 'start' | 'end' = 'start';
    startTimeFormControl: FormControl;
    endTimeFormControl: FormControl;
    yearDate: any;
    monDate: any;
    private _dateFormat: string;
    private _onChange: (value: any) => void;
    private _onTouched: (value: any) => void;
    private _programmaticChange!: boolean;
    private _range: { start: Moment | null; end: Moment | null } = {
        start: null,
        end  : null
    };
    private _timeFormat: string;
    private _timeRange: boolean;
    private _rangeHidden: boolean;
    private _rangeMon: boolean;
    private _picker: boolean = true;
    private readonly _timeRegExp: RegExp = new RegExp('^(0[0-9]|1[0-9]|2[0-4]|[0-9]):([0-5][0-9])(A|(?:AM)|P|(?:PM))?$', 'i');
    private _unsubscribeAll: Subject<any> = new Subject<any>();


    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _elementRef: ElementRef,
        private _overlay: Overlay,
        private _renderer2: Renderer2,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _viewContainerRef: ViewContainerRef,
        private _formBuilder: FormBuilder,
         private _deviceService: DeviceDetectorService
    )
    {
        this.isMobile = this._deviceService.isMobile();
        this._onChange = (): void => {
        };
        this._onTouched = (): void => {
        };
        this.dateFormat = 'DD/MM/YYYY';
        this.timeFormat = '12';

        // Initialize the component
        this._init();
        this.year = _utilService.commonValue(_codeStore.getValue().data, 'YEAR');
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for dateFormat input
     *
     * @param value
     */
    @Input()
    set dateFormat(value: string)
    {
        // Return if the values are the same
        if ( this._dateFormat === value )
        {
            return;
        }

        // Store the value
        this._dateFormat = value;
    }

    get dateFormat(): string
    {
        return this._dateFormat;
    }

    /**
     * Setter & getter for timeFormat input
     *
     * @param value
     */
    @Input()
    set timeFormat(value: string)
    {
        // Return if the values are the same
        if ( this._timeFormat === value )
        {
            return;
        }

        // Set format based on the time format input
        this._timeFormat = value === '12' ? 'hh:mmA' : 'HH:mm';
    }

    get timeFormat(): string
    {
        return this._timeFormat;
    }

    @Input()
    set picker(value: boolean)
    {
        // Return if the values are the same
        if (value)
        {
            this._picker = true;
        }else{
            this._picker = false;
        }
    }
    get picker(): boolean
    {
        return this._picker;
    }

    /**
     * Setter & getter for timeRange input
     *
     * @param value
     */
    @Input()
    set timeRange(value: boolean)
    {
        // Return if the values are the same
        if ( this._timeRange === value )
        {
            return;
        }

        // Store the value
        this._timeRange = value;

        // If the time range turned off...
        if ( !value )
        {
            this.range = {
                start: this._range.start.clone().startOf('day'),
                end  : this._range.end.clone().endOf('day')
            };
        }
    }

    get timeRange(): boolean
    {
        return this._timeRange;
    }

    /**
     * Setter & getter for timeRange input
     *
     * @param value
     */
    @Input()
    set rangeHidden(value: boolean)
    {
        // Return if the values are the same
        if (value)
        {
            this._rangeHidden = true;
        }else{
            this._rangeHidden = false;
        }
    }

    get rangeHidden(): boolean
    {
        return this._rangeHidden;
    }

    @Input()
    set rangemon(value: boolean)
    {
        // Return if the values are the same
        if (value)
        {
            this._rangeMon = true;
        }else{
            this._rangeMon = false;
        }
    }

    get rangemon(): boolean
    {
        return this._rangeMon;
    }

    /**
     * Setter & getter for range input
     *
     * @param value
     */
    @Input()
    set range(value)
    {
        if ( !value )
        {
            return;
        }

        // Check if the value is an object and has 'start' and 'end' values
        if ( !value.start || !value.end )
        {
            console.error('Range input must have "start" and "end" properties!');

            return;
        }

        // Check if we are setting an individual date or both of them
        const whichDate = value.whichDate || null;

        // Get the start and end dates as moment
        const start = moment(value.start);
        const end = moment(value.end);

        // If we are only setting the start date...
        if ( whichDate === 'start' )
        {
            // Set the start date
            this._range.start = start.clone();

            // If the selected start date is after the end date...
            if ( this._range.start.isAfter(this._range.end) )
            {
                // Set the end date to the start date but keep the end date's time
                const endDate = start.clone().hours(this._range.end.hours()).minutes(this._range.end.minutes()).seconds(this._range.end.seconds());

                // Test this new end date to see if it's ahead of the start date
                if ( this._range.start.isBefore(endDate) )
                {
                    // If it's, set the new end date
                    this._range.end = endDate;
                }
                else
                {
                    // Otherwise, set the end date same as the start date
                    this._range.end = start.clone();
                }
            }
        }

        // If we are only setting the end date...
        if ( whichDate === 'end' )
        {
            // Set the end date
            this._range.end = end.clone();

            // If the selected end date is before the start date...
            if ( this._range.start.isAfter(this._range.end) )
            {
                // Set the start date to the end date but keep the start date's time
                const startDate = end.clone().hours(this._range.start.hours()).minutes(this._range.start.minutes()).seconds(this._range.start.seconds());

                // Test this new end date to see if it's ahead of the start date
                if ( this._range.end.isAfter(startDate) )
                {
                    // If it's, set the new start date
                    this._range.start = startDate;
                }
                else
                {
                    // Otherwise, set the start date same as the end date
                    this._range.start = end.clone();
                }
            }
        }

        // If we are setting both dates...
        if ( !whichDate )
        {
            // Set the start date
            this._range.start = start.clone();

            // If the start date is before the end date, set the end date as normal.
            // If the start date is after the end date, set the end date same as the start date.
            this._range.end = start.isBefore(end) ? end.clone() : start.clone();
        }

        // Prepare another range object that holds the ISO formatted range dates
        const range = {
            start: this._range.start.clone().toISOString(),
            end  : this._range.end.clone().toISOString()
        };

        // Emit the range changed event with the range
        this.rangeChanged.emit(range);

        // Update the model with the range if the change was not a programmatic change
        // Because programmatic changes trigger writeValue which triggers onChange and onTouched
        // internally causing them to trigger twice which breaks the form's pristine and touched
        // statuses.
        if ( !this._programmaticChange )
        {
            this._onTouched(range);
            this._onChange(range);
        }

        // Set the active dates
        this.activeDates = {
            month1: this._range.start.clone(),
            month2: this._range.start.clone().add(1, 'month')
        };

        // Set the time form controls
        this.startTimeFormControl.setValue(this._range.start.clone().format(this._timeFormat).toString());
        this.endTimeFormControl.setValue(this._range.end.clone().format(this._timeFormat).toString());

        // Run ngAfterContentInit on month views to trigger
        // re-render on month views if they are available
        if ( this._matMonthView1 && this._matMonthView2 )
        {
            this._matMonthView1.ngAfterContentInit();
            this._matMonthView2.ngAfterContentInit();
        }

        // Reset the programmatic change status
        this._programmaticChange = false;

        this._changeDetectorRef.markForCheck();
    }

    get range(): any
    {
        // Clone the range start and end
        const start = this._range.start.clone();
        const end = this._range.end.clone();
        // Build and return the range object
        return {
            startDate: start.clone().format(this.dateFormat),
            startTime: this.timeRange ? start.clone().format(this.timeFormat) : null,
            endDate  : end.clone().format(this.dateFormat),
            endTime  : this.timeRange ? end.clone().format(this.timeFormat) : null
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Control Value Accessor
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the form model on change
     *
     * @param fn
     */
    registerOnChange(fn: any): void
    {
        this._onChange = fn;
    }

    /**
     * Update the form model on blur
     *
     * @param fn
     */
    registerOnTouched(fn: any): void
    {
        this._onTouched = fn;
    }

    /**
     * Write to view from model when the form model changes programmatically
     *
     * @param range
     */
    writeValue(range: { start: string; end: string }): void
    {
        // Set this change as a programmatic one
        this._programmaticChange = true;

        // Set the range
        this.range = range;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        const today = new Date();
        const YYYY = today.getFullYear();
        this.searchForm = this._formBuilder.group({
           year: [YYYY + ''],
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // @ TODO: Workaround until "angular/issues/20007" resolved
        this.writeValue = (): void => {
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the picker panel
     */
    openPickerPanel(): void
    {
        if(this.picker === true) {
            const overlayRef = this._overlay.create({
                panelClass      : 'fuse-date-range-panel',
                backdropClass   : '',
                hasBackdrop     : true,
                scrollStrategy  : this._overlay.scrollStrategies.reposition(),
                positionStrategy: this._overlay.position()
                    .flexibleConnectedTo(this._pickerPanelOrigin)
                    .withPositions([
                        {
                            originX : 'start',
                            originY : 'bottom',
                            overlayX: 'start',
                            overlayY: 'top',
                            offsetY : 8
                        },
                        {
                            originX : 'start',
                            originY : 'top',
                            overlayX: 'start',
                            overlayY: 'bottom',
                            offsetY : -8
                        }
                    ])
            });

            // Create a portal from the template
            const templatePortal = new TemplatePortal(this._pickerPanel, this._viewContainerRef);

            // On backdrop click
            overlayRef.backdropClick().subscribe(() => {

                // If template portal exists and attached...
                if ( templatePortal && templatePortal.isAttached )
                {
                    // Detach it
                    templatePortal.detach();
                }

                // If overlay exists and attached...
                if ( overlayRef && overlayRef.hasAttached() )
                {
                    // Detach it
                    overlayRef.detach();
                    overlayRef.dispose();
                }
            });

            // Attach the portal to the overlay
            overlayRef.attach(templatePortal);
        }
    }

    /**
     * Get month label
     *
     * @param month
     */
    getMonthLabel(month: number): string
    {
        if ( month === 1 )
        {
            return this.activeDates.month1.clone().format('Y??? MM???');
        }
        return this.activeDates.month2.clone().format('Y??? MM???');
    }

    /**
     * Date class function to add/remove class names to calendar days
     */
    dateClass(): any
    {
        return (date: Moment): MatCalendarCellCssClasses => {

            // If the date is both start and end date...
            if ( date.isSame(this._range.start, 'day') && date.isSame(this._range.end, 'day') )
            {
                return ['fuse-date-range', 'fuse-date-range-start', 'fuse-date-range-end'];
            }

            // If the date is the start date...
            if ( date.isSame(this._range.start, 'day') )
            {
                return ['fuse-date-range', 'fuse-date-range-start'];
            }

            // If the date is the end date...
            if ( date.isSame(this._range.end, 'day') )
            {
                return ['fuse-date-range', 'fuse-date-range-end'];
            }

            // If the date is in between start and end dates...
            if ( date.isBetween(this._range.start, this._range.end, 'day') )
            {
                return ['fuse-date-range', 'fuse-date-range-mid'];
            }

            return undefined;
        };
    }

    /**
     * Date filter to enable/disable calendar days
     */
    dateFilter(): any
    {
        // If we are selecting the end date, disable all the dates that comes before the start date
        return (date: Moment): boolean => !(this.setWhichDate === 'end' && date.isBefore(this._range.start, 'day'));
    }

    /**
     * On selected date change
     *
     * @param date
     */
    onSelectedDateChange(date: Moment): void
    {
        // Create a new range object
        const newRange = {
            start    : this._range.start.clone().toISOString(),
            end      : this._range.end.clone().toISOString(),
            whichDate: null
        };

        // Replace either the start or the end date with the new one
        // depending on which date we are setting
        if ( this.setWhichDate === 'start' )
        {
            newRange.start = moment(newRange.start).year(date.year()).month(date.month()).date(date.date()).toISOString();
        }
        else
        {
            newRange.end = moment(newRange.end).year(date.year()).month(date.month()).date(date.date()).toISOString();
        }

        // Append the which date to the new range object
        newRange.whichDate = this.setWhichDate;

        // Switch which date to set on the next run
        this.setWhichDate = this.setWhichDate === 'start' ? 'end' : 'start';

        // Set the range
        this.range = newRange;
    }

    /**
     * Go to previous month on both views
     */
    prev(): void
    {
        this.activeDates.month1 = moment(this.activeDates.month1).subtract(1, 'month');
        this.activeDates.month2 = moment(this.activeDates.month2).subtract(1, 'month');
    }

    /**
     * Go to next month on both views
     */
    next(): void
    {
        this.activeDates.month1 = moment(this.activeDates.month1).add(1, 'month');
        this.activeDates.month2 = moment(this.activeDates.month2).add(1, 'month');
    }

    /**
     * Update the start time
     *
     * @param event
     */
    updateStartTime(event): void
    {
        // Parse the time
        const parsedTime = this._parseTime(event.target.value);

        // Go back to the previous value if the form control is not valid
        if ( this.startTimeFormControl.invalid )
        {
            // Override the time
            const time = this._range.start.clone().format(this._timeFormat);

            // Set the time
            this.startTimeFormControl.setValue(time);

            // Do not update the range
            return;
        }

        // Append the new time to the start date
        const startDate = this._range.start.clone().hours(parsedTime.hours()).minutes(parsedTime.minutes());

        // If the new start date is after the current end date,
        // use the end date's time and set the start date again
        if ( startDate.isAfter(this._range.end) )
        {
            const endDateHours = this._range.end.hours();
            const endDateMinutes = this._range.end.minutes();

            // Set the start date
            startDate.hours(endDateHours).minutes(endDateMinutes);
        }

        // If everything is okay, set the new date
        this.range = {
            start    : startDate.toISOString(),
            end      : this._range.end.clone().toISOString(),
            whichDate: 'start'
        };
    }

    /**
     * Update the end time
     *
     * @param event
     */
    updateEndTime(event): void
    {
        // Parse the time
        const parsedTime = this._parseTime(event.target.value);

        // Go back to the previous value if the form control is not valid
        if ( this.endTimeFormControl.invalid )
        {
            // Override the time
            const time = this._range.end.clone().format(this._timeFormat);

            // Set the time
            this.endTimeFormControl.setValue(time);

            // Do not update the range
            return;
        }

        // Append the new time to the end date
        const endDate = this._range.end.clone().hours(parsedTime.hours()).minutes(parsedTime.minutes());

        // If the new end date is before the current start date,
        // use the start date's time and set the end date again
        if ( endDate.isBefore(this._range.start) )
        {
            const startDateHours = this._range.start.hours();
            const startDateMinutes = this._range.start.minutes();

            // Set the end date
            endDate.hours(startDateHours).minutes(startDateMinutes);
        }

        // If everything is okay, set the new date
        this.range = {
            start    : this._range.start.clone().toISOString(),
            end      : endDate.toISOString(),
            whichDate: 'end'
        };
    }

    //mediro date button settings
    clickDate(dateGbn: string): void
    {
        if(dateGbn === 'today'){
            this.range = {
                end: moment().utc(true).startOf('day').toISOString(),
                start  : moment().utc(true).add(-1, 'day').endOf('day').toISOString(),
            };
        }else if(dateGbn === 'week'){
            this.range = {
                end: moment().utc(true).startOf('day').toISOString(),
                start  : moment().utc(true).add(-7, 'day').endOf('day').toISOString()
            };
        }else if(dateGbn === '1mon'){
            this.range = {
                end: moment().utc(true).startOf('day').toISOString(),
                start  : moment().utc(true).add(-2, 'month').endOf('month').toISOString()
            };
        }else if(dateGbn === '3mon'){
            this.range = {
                end: moment().utc(true).startOf('day').toISOString(),
                start  : moment().utc(true).add(-3, 'month').endOf('month').toISOString()
            };
        }else if(dateGbn === '6mon'){
            this.range = {
                end: moment().utc(true).startOf('day').toISOString(),
                start  : moment().utc(true).add(-6, 'month').endOf('month').toISOString()
            };
        }else if(dateGbn === '1year'){
            this.range = {
                end: moment().utc(true).startOf('day').toISOString(),
                start  : moment().utc(true).add(-1, 'year').endOf('year').toISOString()
            };
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Initialize
     *
     * @private
     */
    private _init(): void
    {
        // Start and end time form controls
        this.startTimeFormControl = new FormControl('', [Validators.pattern(this._timeRegExp)]);
        this.endTimeFormControl = new FormControl('', [Validators.pattern(this._timeRegExp)]);

        // Set the default range  //????????? ?????? ?????? start??? ???????????? end??? ?????? ?????????
        this._programmaticChange = true;
        this.range = {
                start: moment().add(-7, 'day').endOf('day').toISOString(),
                end  : moment().startOf('day').toISOString()
            };
        // Set the default time range
        this._programmaticChange = true;
        this.timeRange = true;
    }

    /**
     * Parse the time from the inputs
     *
     * @param value
     * @private
     */
    private _parseTime(value: string): Moment
    {
        // Parse the time using the time regexp
        const timeArr = value.split(this._timeRegExp).filter(part => part !== '');

        // Get the meridiem
        const meridiem = timeArr[2] || null;

        // If meridiem exists...
        if ( meridiem )
        {
            // Create a moment using 12-hours format and return it
            return moment(value, 'hh:mmA').seconds(0);
        }

        // If meridiem doesn't exist, create a moment using 24-hours format and return in
        return moment(value, 'HH:mm').seconds(0);
    }
    selectDate(m: number) {
        this.monDate = m;
        let year = this.yearDate;
        if(year === null || year === undefined) {
            year = new Date().getFullYear();
        }
        const startDay = new Date(year, m, 1).setHours(9);
        const endDay = new Date(year, m + 1, 0).setHours(9);
        this.range = {
            end: endDay,
            start  : startDay
        };
        this._changeDetectorRef.markForCheck();
    }

    selectYear(y: any): void {
        if(y !== null || y !== undefined) {
            this.yearDate = y;
        }
        const m = 0;
        const startDay = new Date(y, m, 1).setHours(9);
        const endDay = new Date(y, m + 12, 0).setHours(9);
        this.range = {
            start: startDay,
            end: endDay
        };
    }
    selectDateYear(date: string): void {
        let y;
        y = this.yearDate;
        if(y === null || y === undefined) {
            y = new Date().getFullYear();
        }
        if(date === '1/4') {
            const m = 0;
            const startDay = new Date(y, m, 1).setHours(9);
            const endDay = new Date(y, m + 3, 0).setHours(9);
                this.range = {
                start: startDay,
                end: endDay
            };
        }
        if(date === '2/4') {
            const m = 3;
            const startDay = new Date(y, m, 1).setHours(9);
            const endDay = new Date(y, m + 3, 0).setHours(9);
            this.range = {
                start: startDay,
                end: endDay
            };
        }
        if(date === '3/4') {
            const m = 6;
            const startDay = new Date(y, m, 1).setHours(9);
            const endDay = new Date(y, m + 3, 0).setHours(9);
            this.range = {
                start: startDay,
                end: endDay
            };
        }
        if(date === '4/4') {
            const m = 9;
            const startDay = new Date(y, m, 1).setHours(9);
            const endDay = new Date(y, m + 3, 0).setHours(9);
            this.range = {
                start: startDay,
                end: endDay
            };
        }
        if(date === '?????????') {
            const m = 0;
            const startDay = new Date(y, m, 1).setHours(9);
            const endDay = new Date(y, m + 6, 0).setHours(9);
            this.range = {
                start: startDay,
                end: endDay
            };
        }
        if(date === '?????????') {
            const m = 6;
            const startDay = new Date(y, m, 1).setHours(9);
            const endDay = new Date(y, m + 6, 0).setHours(9);
            this.range = {
                start: startDay,
                end: endDay
            };
        }
        if(date === '???') {
            const m = 0;
            const startDay = new Date(y, m, 1).setHours(9);
            const endDay = new Date(y, m + 12, 0).setHours(9);
            this.range = {
                start: startDay,
                end: endDay
            };
        }
    }

}
