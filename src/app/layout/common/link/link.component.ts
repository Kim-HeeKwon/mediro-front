import {
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    Input,
    OnChanges,
    OnDestroy,
    OnInit, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";
import {Shortcut} from "../shortcuts/shortcuts.types";
import {MatButton} from "@angular/material/button";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Overlay, OverlayRef} from "@angular/cdk/overlay";
import {Subject} from "rxjs";
import {TemplatePortal} from "@angular/cdk/portal";

@Component({
    selector       : 'links',
    templateUrl    : './link.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkComponent implements OnChanges, OnInit, OnDestroy
{
    @Input() links: any;
    @ViewChild('linkOrigin') private _linksOrigin: MatButton;
    @ViewChild('linkPanel') private _linksPanel: TemplateRef<any>;

    linkForm: FormGroup;
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: FormBuilder,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    )
    {
    }

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.links = [{
            title : '의료기기 정보 포털',
            subTitle : '식품의약품안전처 의료기기 정보 포털',
            icon : 'medical_services',
            link: 'https://udiportal.mfds.go.kr/',
            target : 'udiportalA',
        },{
            title : '의료기기 통합정보 시스템',
            subTitle : '식품의약품안전처 의료기기 통합정보 시스템',
            icon : 'wysiwyg',
            link: 'https://udiportal.mfds.go.kr/udi/login',
            target : 'udiportalB',
        }];
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // Dispose the overlay
        if ( this._overlayRef )
        {
            this._overlayRef.dispose();
        }
    }

    /**
     * Open the shortcuts panel
     */
    openPanel(): void
    {
        // Create the overlay if it doesn't exist
        if ( !this._overlayRef )
        {
            this._createOverlay();
        }


        // Attach the portal to the overlay
        this._overlayRef.attach(new TemplatePortal(this._linksPanel, this._viewContainerRef));
    }

    /**
     * Close the messages panel
     */
    closePanel(): void
    {
        this._overlayRef.detach();
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    /**
     * Create the overlay
     */
    private _createOverlay(): void
    {
        // Create the overlay
        this._overlayRef = this._overlay.create({
            hasBackdrop     : true,
            backdropClass   : 'fuse-backdrop-on-mobile',
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._linksOrigin._elementRef.nativeElement)
                .withLockedPosition()
                .withPush(true)
                .withPositions([
                    {
                        originX : 'start',
                        originY : 'bottom',
                        overlayX: 'start',
                        overlayY: 'top'
                    },
                    {
                        originX : 'start',
                        originY : 'top',
                        overlayX: 'start',
                        overlayY: 'bottom'
                    },
                    {
                        originX : 'end',
                        originY : 'bottom',
                        overlayX: 'end',
                        overlayY: 'top'
                    },
                    {
                        originX : 'end',
                        originY : 'top',
                        overlayX: 'end',
                        overlayY: 'bottom'
                    }
                ])
        });

        // Detach the overlay from the portal on backdrop click
        this._overlayRef.backdropClick().subscribe(() => {
            this._overlayRef.detach();
        });
    }

    linkCall(links: any) {
        console.log(links.link);
        this.winopen(links.link, links.target, 'top=50,left=200,width=1100,height=700');
    }


    winopen(url: string, target: string, features: string): void {
        window.open(url, target, features);
    }
}
