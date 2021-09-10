import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef, Input,
    OnDestroy,
    OnInit, Renderer2, ViewContainerRef,
    ViewEncapsulation
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {Overlay} from '@angular/cdk/overlay';
import {Subject} from 'rxjs';
import {UserHelpService} from './user-help-service';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector     : 'fuse-user-help',
    templateUrl  : './user-help.component.html',
    styleUrls    : ['./user-help.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs     : 'fuseUserHelp',
    providers    : [
    ]
})
export class FuseUserHelpComponent implements ControlValueAccessor, OnInit, OnDestroy
{
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _helpCd: string;
    private _descr: string;
    private _display: boolean;
    private windowPopup: any =  null;
    /**
     * Constructor
     */
    constructor(
        private _userHelpService: UserHelpService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _elementRef: ElementRef,
        private _overlay: Overlay,
        private _renderer2: Renderer2,
        private _viewContainerRef: ViewContainerRef
    )
    {
        // Initialize the component
        this._init();
    }

    /**
     * Initialize
     *
     * @private
     */
    private _init(): void
    {

    }

    /**
     * On init
     */
    // eslint-disable-next-line @typescript-eslint/member-ordering
    ngOnInit(): void
    {

    }

    /**
     * On destroy
     */
    // eslint-disable-next-line @typescript-eslint/member-ordering
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

    }


    /**
     * Write to view from model when the form model changes programmatically
     *
     * @param range
     */
    // eslint-disable-next-line @typescript-eslint/member-ordering
    writeValue(url: string): void
    {
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    registerOnChange(fn: any): void {
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    registerOnTouched(fn: any): void {
    }

    /**
     * Setter & getter
     *
     * @param value
     */
    @Input()
    set helpCd(value: string)
    {
        // Return if the values are the same
        if ( this._helpCd === value )
        {
            return;
        }

        // Store the value
        this._helpCd = value;

        // If the time range turned off...
        if ( !value )
        {
        }
    }

    get helpCd(): string
    {
        return this._helpCd;
    }

    /**
     * Setter & getter
     *
     * @param value
     */
    @Input()
    set display(value: boolean)
    {
        // Return if the values are the same
        if ( this._display === value )
        {
            return;
        }

        // Store the value
        this._display = value;

        // If the time range turned off...
        if ( !value )
        {
        }
    }

    get display(): boolean
    {
        return this._display;
    }

    /**
     * Setter & getter
     *
     * @param value
     */
    @Input()
    set descr(value: string)
    {
        // Return if the values are the same
        if ( this._descr === value )
        {
            return;
        }

        // Store the value
        this._descr = value;

        // If the time range turned off...
        if ( !value )
        {
        }
    }

    get descr(): string
    {
        return this._descr;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    userHelp(): void {
        const sendData = {helpCd : this._helpCd};

        this._userHelpService.getUserHelp(sendData)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response: any) => {
                let url = '';
                if(response.data[0] !== null){
                    if(response.data[0].url !== ''){
                        url = response.data[0].url;
                    }
                }

                if(url !== ''){
                    window.open(url, this._helpCd,'top=50,left=200,width=1100,height=700');
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
}
