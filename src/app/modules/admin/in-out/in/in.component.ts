import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatDrawer} from '@angular/material/sidenav';
import {Observable, Subject} from 'rxjs';
import {FuseMediaWatcherService} from '@teamplat/services/media-watcher';
import {takeUntil} from 'rxjs/operators';
import {InService} from "./in.service";
import {CodeStore} from "../../../../core/common-code/state/code.store";
import {CommonCode, FuseUtilsService} from "../../../../../@teamplat/services/utils";

@Component({
    selector: 'app-in',
    templateUrl: './in.component.html',
    styleUrls: ['./in.component.scss']
})
export class InComponent implements OnInit, OnDestroy {

    @ViewChild('drawer') drawer: MatDrawer;

    showMobile$: Observable<boolean>;
    showMobile: boolean = false;

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    searchInputControl: FormControl = new FormControl();
    itemsCount: number = 1;
    itemsTableColumns: string[] = ['name', 'sku', 'price'];
    selectedItemsForm: FormGroup;
    searchForm: FormGroup;
    ibType: CommonCode[] = [];
    ibStatus: CommonCode[] = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _formBuilder: FormBuilder,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _inService: InService) {
        this.ibType = _utilService.commonValue(_codeStore.getValue().data,'IB_TYPE');
        this.ibStatus = _utilService.commonValue(_codeStore.getValue().data,'IB_STATUS');
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            ibType: [''],
            ibStatus: [''],
            accountType: [''],
            accountName: [''],
            itemCd: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened if the given breakpoint is active
                if ( matchingAliases.includes('md') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }
            });

        //
        this.showMobile$ = this._inService.showMobile$;

        this._inService.showMobile$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((showMobile: any) => {
                this.showMobile = showMobile;
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

}
