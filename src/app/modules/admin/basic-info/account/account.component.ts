import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
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
import {fuseAnimations} from '../../../../../@teamplat/animations';
import {CommonCode, CommonPopup, FuseUtilsService} from '@teamplat/services/utils';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {FuseAlertType} from '../../../../../@teamplat/components/alert';
import {PopupStore} from '../../../../core/common-popup/state/popup.store';
import {NewAccountComponent} from '../account/new-account/new-account.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
    selector: 'app-account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations     : fuseAnimations
})
export class AccountComponent implements OnInit, OnDestroy, AfterViewInit {

    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    @ViewChild(MatSort) private _sort: MatSort;

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
    selectedAccount: AccountData | null = null;
    flashMessage: 'success' | 'error' | null = null;
    accountType: CommonCode[] = null;
    pAccount: CommonPopup[] = null;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    showAlert: boolean = false;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    // eslint-disable-next-line @typescript-eslint/member-ordering
    formFieldHelpers: string[] = [''];

    constructor(
        private _matDialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _accountService: AccountService,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _popupStore: PopupStore,
        private _utilService: FuseUtilsService)
    {
        this.accountType = _utilService.commonValue(_codeStore.getValue().data,'ACCOUNT_TYPE');
        this.pAccount = _utilService.commonPopupValue(_popupStore.getValue().data, 'P$_ACCOUNT');
    }

    ngOnInit(): void {

        // 고객사 Form 생성
        this.selectedAccountForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            account: ['', [Validators.required]], // 고객사
            descr: ['', [Validators.required]],   // 고객사 명
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
                this.accountsCount = accounts.length;

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

        // Get products if sort or page changes
        merge(this._sort.sortChange, this._paginator.page).pipe(
            switchMap(() => {
                // this.closeDetails();
                this.isLoading = true;
                return this._accountService.getAccount(this._paginator.pageIndex, this._paginator.pageSize, this._sort.active, this._sort.direction);
            }),
            map(() => {
                this.isLoading = false;
            })
        ).subscribe();
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
        this.selectedAccount = null;
    }

    /**
     * Add a new note
     */
    selectAccount(): void
    {
        this._accountService.getAccount();
    }
    /**
     * Add a new note
     */
    createAccount(): void
    {
        this._matDialog.open(NewAccountComponent, {
            autoFocus: false,
            data     : {
                note: {}
            }
        });
    }
    /**
     * 업데이트
     */
    updateAccount(): void
    {
        const accountData = this.selectedAccountForm.value;

        accountData.account = this.selectedAccount.account;
        accountData.accountType = this.selectedAccount.accountType;

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

}
