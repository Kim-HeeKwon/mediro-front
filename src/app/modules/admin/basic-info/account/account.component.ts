import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, ElementRef,
    OnDestroy,
    OnInit, Renderer2,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {merge, Observable, Subject} from 'rxjs';
import {AccountService} from './account.service';
import {AccountData, AccountPagenation} from './account.types';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {fuseAnimations} from '@teamplat/animations';
import {CommonCode, FuseUtilsService} from '@teamplat/services/utils';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {NewAccountComponent} from '../account/new-account/new-account.component';``
import {MatDialog} from '@angular/material/dialog';
import {postcode} from '../../../../../assets/js/postCode';
import {geodata} from '../../../../../assets/js/geoCode';
import {DeleteAlertComponent} from '@teamplat/components/common-alert/delete-alert';
import {CommonUdiComponent} from '@teamplat/components/common-udi';
import {DeviceDetectorService} from 'ngx-device-detector';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class AccountComponent implements OnInit, OnDestroy, AfterViewInit {
    isExtraSmall: Observable<BreakpointState> = this.breakpointObserver.observe(
        Breakpoints.XSmall
    );
    @ViewChild('daum_popup', { read: ElementRef, static: true }) popup: ElementRef;
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;
    isMobile: boolean = false;

    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;

    accounts$: Observable<AccountData[]>;
    pagenation: AccountPagenation | null = null;

    isLoading: boolean = false;
    searchInputControl: FormControl = new FormControl();
    accountsCount: number = 0;
    accountsTableColumns: string[] = [
        'details',
        'account',
        'descr',
        'accountType',
        'custBusinessNumber',
        'custBusinessName',
        'representName',
        'businessCondition',
        'businessCategory',
        'address',
        'addressDetail',
        'phoneNumber',
        'fax',
        'email',
    ];
    selectedAccountForm: FormGroup;
    searchForm: FormGroup;
    selectedAccount: AccountData | null = null;
    flashMessage: 'success' | 'error' | null = null;
    accountType: CommonCode[] = null;

    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '거래처 코드'
        },
        {
            id: '101',
            name: '거래처 명'
        }];


    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    formFieldHelpers: string[] = [''];


    constructor(
        private _matDialog: MatDialog,
        public _matDialogPopup: MatDialog,
        private _formBuilder: FormBuilder,
        private _renderer: Renderer2,
        private _accountService: AccountService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _deviceService: DeviceDetectorService,
        private readonly breakpointObserver: BreakpointObserver)
    {
        this.accountType = _utilService.commonValue(_codeStore.getValue().data,'ACCOUNT_TYPE');
        this.isMobile = this._deviceService.isMobile();
    }

    ngOnInit(): void {

        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            accountType: ['ALL'],
            descr: [''],
            account: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        // 고객사 Form 생성
        this.selectedAccountForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            account: ['', [Validators.required]], // 거래처 코드
            udiAccount: [''],
            udiHptlSymbl: [''],
            descr: ['', [Validators.required]],   // 거래처 명
            accountType: ['', [Validators.required]],   // 유형
            custBusinessNumber : [''],
            custBusinessName: [''],
            representName: [''],
            businessCondition: [''],
            businessCategory: [''],
            address: [''],
            addressDetail: [''],
            addressX: [''],
            addressY: [''],
            addressZoneNo: [''],
            phoneNumber: [''],
            fax: [''],
            email: [''],
            active: [false]  // cell상태
        });

        //const account = this.selectedAccountForm.get('account');
        //const accountType = this.selectedAccountForm.get('accountType');
        //account.disable();
        //accountType.disable();

        // getAccout
        this.accounts$ = this._accountService.accounts$;

        this._accountService.accounts$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((accounts: any) => {
                // Update the counts
                if(accounts !== null){
                    this.accountsCount = accounts.length;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the pagenation
        this._accountService.pagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((pagenation: AccountPagenation) => {
                // Update the pagination
                this.pagenation = pagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        // If the user changes the sort order...
        // this._sort.sortChange
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe(() => {
        //         // Reset back to the first page
        //         this._paginator.pageIndex = 0;
        //
        //         // Close the details
        //         this.closeDetails();
        //     });

        if(this._sort !== undefined){
            // Get products if sort or page changes
            merge(this._sort.sortChange, this._paginator.page).pipe(
                switchMap(() => {
                    // console.log('change paginator!!');
                    // console.log(this._paginator.pageIndex);
                    // console.log(this._paginator.pageSize);
                    // console.log(this._sort.active);
                    // console.log(this._sort);
                    // this.closeDetails();
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._accountService.getAccount(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction, this.searchForm.getRawValue());
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
        }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }
    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param account
     */
    trackByFn(index: number, account: any): any {
        return account.id || index;
    }

    /**
     * Toggle product details
     *
     * @param account
     */
    toggleDetails(account: string): void
    {
        // If the Account is already selected...
        if ( this.selectedAccount && this.selectedAccount.account === account )
        {
            // Close the details
            this.closeDetails();
            return;
        }

        this.selectedAccountForm.controls['account'].disable();
        this.selectedAccountForm.controls['accountType'].disable();
        this.selectedAccountForm.controls['custBusinessNumber'].disable();

        // Get the product by account
        this._accountService.getAccountsById(account)
            .subscribe((accountData) => {
                // Set the selected Account
                this.selectedAccount = accountData;

                // Fill the form
                // @ts-ignore
                this.selectedAccountForm.patchValue(accountData);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * Close the details
     */
    closeDetails(): void
    {
        this.closeAddressPopup();
        this.selectedAccount = null;
    }

    /**
     * Add a new note
     */
    selectAccount(): void
    {
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'account': this.searchForm.getRawValue().searchText});
            this.searchForm.patchValue({'descr': ''});
        }else if(this.searchForm.getRawValue().searchCondition === '101'){
            this.searchForm.patchValue({'account': ''});
            this.searchForm.patchValue({'descr': this.searchForm.getRawValue().searchText});
        }

        this._accountService.getAccount(0,10,'account','asc',this.searchForm.getRawValue());
    }
    /**
     * Add a new note
     */
    createAccount(): void
    {
        if(!this.isMobile){
            this._matDialog.open(NewAccountComponent, {
                autoFocus: false,
                disableClose: true,
                data     : {
                    note: {}
                },
            });
        }else{
            const d = this._matDialog.open(NewAccountComponent, {
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)','');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe(() => {
                smallDialogSubscription.unsubscribe();
            });
        }
    }
    /**
     * Add a new note
     */
    createUdiAccount(): void
    {
        if(!this.isMobile){
            const popupUdi =this._matDialogPopup.open(CommonUdiComponent, {
                data: {
                    headerText : '거래처 조회',
                    url : 'https://udiportal.mfds.go.kr/api/v1/company-info/bcnc',
                    searchList : ['companyName', 'taxNo', 'cobFlagCode'],
                    code: 'UDI_BCNC',
                    tail : false,
                    mediroUrl : 'bcnc/company-info',
                    tailKey : '',
                },
                autoFocus: false,
                maxHeight: '80vh',
                disableClose: true
            });

            popupUdi.afterClosed().subscribe((result) => {
                if(result){
                    console.log(result);
                }
            });
        }else{
            const d = this._matDialog.open(CommonUdiComponent, {
                data: {
                    headerText : '거래처 조회',
                    url : 'https://udiportal.mfds.go.kr/api/v1/company-info/bcnc',
                    searchList : ['companyName', 'taxNo', 'cobFlagCode'],
                    code: 'UDI_BCNC',
                    tail : false,
                    mediroUrl : 'bcnc/company-info',
                    tailKey : '',
                },
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)','');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe((result) => {
                smallDialogSubscription.unsubscribe();
                if(result){
                    console.log(result);
                }
            });
        }
    }
    /**
     * Add a new note
     */
    createUdiEntrpsAccount(): void
    {
        if(!this.isMobile){
            const popupUdi =this._matDialogPopup.open(CommonUdiComponent, {
                data: {
                    headerText : '통합업체 조회',
                    url : 'https://udiportal.mfds.go.kr/api/v1/company-info/entrps',
                    searchList : ['entpName', 'cobFlagCode'],
                    code: 'UDI_ENTRPS',
                    tail : false,
                    mediroUrl : 'entrps/company-info',
                    tailKey : '',
                },
                autoFocus: false,
                maxHeight: '80vh',
                disableClose: true
            });

            popupUdi.afterClosed().subscribe((result) => {
                if(result){
                    console.log(result);
                }
            });
        }else{
            const d = this._matDialog.open(CommonUdiComponent, {
                data: {
                    headerText : '통합업체 조회',
                    url : 'https://udiportal.mfds.go.kr/api/v1/company-info/entrps',
                    searchList : ['entpName', 'cobFlagCode'],
                    code: 'UDI_ENTRPS',
                    tail : false,
                    mediroUrl : 'entrps/company-info',
                    tailKey : '',
                },
                autoFocus: false,
                width: 'calc(100% - 50px)',
                maxWidth: '100vw',
                maxHeight: '80vh',
                disableClose: true
            });
            const smallDialogSubscription = this.isExtraSmall.subscribe((size: any) => {
                if (size.matches) {
                    d.updateSize('calc(100vw - 10px)','');
                } else {
                    // d.updateSize('calc(100% - 50px)', '');
                }
            });
            d.afterClosed().subscribe((result) => {
                smallDialogSubscription.unsubscribe();
                if(result){
                    console.log(result);
                }
            });
        }
    }
    /**
     * 업데이트
     */
    updateAccount(): void
    {
        const accountData = this.selectedAccountForm.value;

        accountData.account = this.selectedAccount.account;
        accountData.accountType = this.selectedAccount.accountType;
        accountData.custBusinessNumber = this.selectedAccount.custBusinessNumber;

        this._accountService.updateAccount(accountData)
            .subscribe(
                (param: any) => {
                   if(param.status === 'SUCCESS'){
                       this._accountService.getAccount();
                       this.closeDetails();
                   }

                },(response) => {
                });
    }
    /**
     * 삭제
     */
    deleteAccount(): void
    {
        const accountData = this.selectedAccountForm.value;

        accountData.account = this.selectedAccount.account;
        accountData.accountType = this.selectedAccount.accountType;
        accountData.custBusinessNumber = this.selectedAccount.custBusinessNumber;

        const deleteConfirm =this._matDialog.open(DeleteAlertComponent, {
            data: {
            }
        });

        deleteConfirm.afterClosed().subscribe((result) => {

            if(result.status){
                this._accountService.deleteAccount(accountData)
                    .subscribe(
                        (param: any) => {
                            if(param.status === 'SUCCESS'){
                                this._accountService.getAccount();
                                this.closeDetails();
                            }

                        },(response) => {
                        });
            }
        });
    }

    accountSearch(): void{

    }

    openAddressPopup(): void
    {
        postcode(this._renderer, this.popup.nativeElement, (data: any) => {
            geodata(data.address, (result: any) => {
                this.selectedAccountForm.patchValue({'address': result.road_address.address_name});
                this.selectedAccountForm.patchValue({'addressX': result.road_address.x});
                this.selectedAccountForm.patchValue({'addressY': result.road_address.y});
                this.selectedAccountForm.patchValue({'addressZoneNo': result.road_address.zone_no});
            });
        });
    }


    closeAddressPopup(): void
    {
        this._renderer.setStyle(this.popup.nativeElement, 'display', 'none');
    }
}
