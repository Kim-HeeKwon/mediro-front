import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';
import {MatDrawer} from '@angular/material/sidenav';
import {Observable, Subject} from 'rxjs';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {FuseMediaWatcherService} from '../../../../../@teamplat/services/media-watcher';
import {OutService} from './out.service';
import {takeUntil} from 'rxjs/operators';
import {Router} from "@angular/router";

@Component({
    selector: 'app-out',
    templateUrl: './out.component.html',
    styleUrls: ['./out.component.scss']
})
export class OutComponent implements OnInit, OnDestroy {

    @ViewChild('drawer') drawer: MatDrawer;

    showMobile$: Observable<boolean>;
    showMobile: boolean = false;

    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    searchInputControl: FormControl = new FormControl();
    searchForm: FormGroup;
    obType: CommonCode[] = [];
    obStatus: CommonCode[] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _codeStore: CodeStore,
                private _utilService: FuseUtilsService,
                private _router: Router,
                private _formBuilder: FormBuilder,
                private _fuseMediaWatcherService: FuseMediaWatcherService,
                private _outService: OutService) {
        this.obType = _utilService.commonValue(_codeStore.getValue().data,'OB_TYPE');
        this.obStatus = _utilService.commonValue(_codeStore.getValue().data,'OB_STATUS');
    }

    ngOnInit(): void {
        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            obType: ['1'],
            obStatus: ['N'],
            accountType: [''],
            accountNm: [''],
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
        this.showMobile$ = this._outService.showMobile$;

        this._outService.showMobile$
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

    selectHeader(): void
    {
        this.searchForm.patchValue({'accountNm': this.searchForm.getRawValue().searchText});
        this._outService.getHeader(0,10,'obNo','desc',this.searchForm.getRawValue());
    }

    newOut(): void{
        this._router.navigate(['in-out/out/new' , {}]);
    }
}
