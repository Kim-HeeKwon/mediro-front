import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component, Inject,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from "@angular/core";
import {fuseAnimations} from "../../animations";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {FuseUtilsService} from "../../services/utils";
import {FormBuilder, Validators} from "@angular/forms";
import {CodeStore} from "../../../app/core/common-code/state/code.store";
import {PopupStore} from "../../../app/core/common-popup/state/popup.store";
import {TeamPlatConfirmationService} from "../../services/confirmation";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {LatelyCardService} from "./lately-card.service";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../providers/common/common";
import {formatDate} from "@angular/common";

@Component({
    selector: 'app-lately-card',
    templateUrl: './lately-card.component.html',
    styleUrls: ['./lately-card.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: fuseAnimations
})
export class LatelyCardComponent implements OnInit, OnDestroy, AfterViewInit {
    text: string;
    content: string;
    lately: any[];
    row: any[];
    header: any;
    tooltipText: string;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _httpClient: HttpClient,
        private _common: Common,
        public _matDialogRef: MatDialogRef<LatelyCardComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _utilService: FuseUtilsService,
        private _latelyService: LatelyCardService,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _changeDetectorRef: ChangeDetectorRef,
        private _popupStore: PopupStore,
        private dialog: MatDialog,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
    ) {
        this.text = data.text;
        this.content = data.content;

    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {

        this.row = [];
        this.header = null;
        this.tooltipText = '최근 사용하신 ' + this.text + '내역을 선택하여 간편하게 ' + this.text + '서을 생성할 수 있습니다.';
        if (this.content === 'ESTIMATE') {

            const searchParam = {};
            searchParam['order'] = '';
            searchParam['sort'] = '';
            const pageParam = {
                page: 1,
                size: 4,
            };
            //searchParam['excelType'] = excelType;

            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            const rtn = new Promise((resolve, reject) => {
                this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/estimateOrder/estimate/estimate-lately')
                    .subscribe((response: any) => {
                        if (response.status === 'SUCCESS') {
                            resolve(response.data);
                        }
                    }, reject);
            });
            rtn.then((l) => {
                if (l) {
                    // @ts-ignore
                    l.forEach((set) => {
                        const setData = {
                            click: 0,
                            qtNo: set.qtNo,
                            accountNm: set.accountNm,
                            date: set.qtDate
                        };
                        this.row.push(setData);
                    });

                    this.header = l;
                    this.lately = this.row;
                    this._changeDetectorRef.markForCheck();
                }
            });
        } else if (this.content === 'ORDER') {
            const searchParam = {};
            searchParam['order'] = '';
            searchParam['sort'] = '';
            const pageParam = {
                page: 1,
                size: 4,
            };
            //searchParam['excelType'] = excelType;
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            const rtn = new Promise((resolve, reject) => {
                this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/estimateOrder/order/order-lately')
                    .subscribe((response: any) => {
                        if (response.status === 'SUCCESS') {
                            resolve(response.data);
                        }
                    }, reject);
            });
            rtn.then((l) => {
                if (l) {
                    // @ts-ignore
                    l.forEach((set) => {
                        const setData = {
                            click: 0,
                            poNo: set.poNo,
                            accountNm: set.accountNm,
                            date: set.poDate
                        };
                        this.row.push(setData);
                    });

                    this.header = l;
                    this.lately = this.row;
                    this._changeDetectorRef.markForCheck();
                }
            });
        } else if (this.content === 'SALESORDER') {
            const searchParam = {};
            searchParam['order'] = '';
            searchParam['sort'] = '';
            const pageParam = {
                page: 1,
                size: 4,
            };
            //searchParam['excelType'] = excelType;
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            const rtn = new Promise((resolve, reject) => {
                this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/salesorder/salesorder-lately')
                    .subscribe((response: any) => {
                        if (response.status === 'SUCCESS') {
                            resolve(response.data);
                        }
                    }, reject);
            });
            rtn.then((l) => {
                if (l) {
                    // @ts-ignore
                    l.forEach((set) => {
                        const setData = {
                            click: 0,
                            soNo: set.soNo,
                            accountNm: set.accountNm,
                            date: set.soDate
                        };
                        this.row.push(setData);
                    });

                    this.header = l;
                    this.lately = this.row;
                    this._changeDetectorRef.markForCheck();
                }
            });
        }
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    select(lately: any): void {
        const now = new Date();

        this.lately.forEach((a: any) => {
            a.click = 0;
        });
        lately.click = 1;

        if (this.content === 'ESTIMATE') {
            const search = {qtNo: lately.qtNo};
            const searchParam = {};
            searchParam['order'] = 'asc';
            searchParam['sort'] = 'qtLineNo';

            // 검색조건 Null Check
            if ((Object.keys(search).length === 0) === false) {
                // eslint-disable-next-line guard-for-in
                for (const k in search) {
                    searchParam[k] = search[k];
                }
            }

            const pageParam = {
                page: 0,
                size: 1000,
            };

            const rtn = new Promise((resolve, reject) => {
                this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/estimateOrder/estimate/detail-List')
                    .subscribe((response: any) => {
                        if (response.status === 'SUCCESS') {
                            resolve(response.data);
                        }
                    }, reject);
            });
            rtn.then((detail) => {
                // @ts-ignore
                const header = this.header.filter((item: any) => item.qtNo === lately.qtNo).map((param: any) => {
                    //param.qtDate = null;
                    param.qtNo = null;
                    param.qtAmt = 0;
                    param.qtDate = formatDate(new Date(now.setDate(now.getDate())), 'yyyy-MM-dd', 'en');
                    param.effectiveDate = formatDate(new Date(now.setDate(now.getDate() + 1)), 'yyyy-MM-dd', 'en');
                    param.status = 'N';
                    param.type = 'QN';
                    param.qtCreDate = null;
                    if (param.deliveryDate === null) {
                        param.deliveryDate = '';
                    }
                    return param;
                });
                const rtnList = {
                    header: header,
                    detail: detail
                };
                this._matDialogRef.close(rtnList);

            });
        } else if (this.content === 'ORDER') {

            const search = {poNo: lately.poNo};
            const searchParam = {};
            searchParam['order'] = 'asc';
            searchParam['sort'] = 'poLineNo';

            // 검색조건 Null Check
            if ((Object.keys(search).length === 0) === false) {
                // eslint-disable-next-line guard-for-in
                for (const k in search) {
                    searchParam[k] = search[k];
                }
            }

            const pageParam = {
                page: 0,
                size: 1000,
            };

            const rtn = new Promise((resolve, reject) => {
                this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/estimateOrder/order/detail-List')
                    .subscribe((response: any) => {
                        if (response.status === 'SUCCESS') {
                            resolve(response.data);
                        }
                    }, reject);
            });
            rtn.then((detail) => {

                const header = this.header.filter((item: any) => item.poNo === lately.poNo).map((param: any) => {
                    param.poDate = formatDate(new Date(now.setDate(now.getDate())), 'yyyy-MM-dd', 'en');
                    param.deliveryDate = formatDate(new Date(now.setDate(now.getDate() + 7)), 'yyyy-MM-dd', 'en');
                    param.poNo = null;
                    param.poAmt = 0;
                    param.status = 'N';
                    param.poCreDate = null;

                    if (param.deliveryDate === null) {
                        param.deliveryDate = '';
                    }
                    return param;
                });
                const rtnList = {
                    header: header,
                    detail: detail
                };
                this._matDialogRef.close(rtnList);

            });
        } else if (this.content === 'SALESORDER') {

            const search = {soNo: lately.soNo};
            const searchParam = {};
            searchParam['order'] = 'asc';
            searchParam['sort'] = 'soLineNo';

            // 검색조건 Null Check
            if ((Object.keys(search).length === 0) === false) {
                // eslint-disable-next-line guard-for-in
                for (const k in search) {
                    searchParam[k] = search[k];
                }
            }

            const pageParam = {
                page: 0,
                size: 1000,
            };

            const rtn = new Promise((resolve, reject) => {
                this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/salesorder/detail-List')
                    .subscribe((response: any) => {
                        if (response.status === 'SUCCESS') {
                            resolve(response.data);
                        }
                    }, reject);
            });
            rtn.then((detail) => {

                const header = this.header.filter((item: any) => item.soNo === lately.soNo).map((param: any) => {
                    param.soDate = formatDate(new Date(now.setDate(now.getDate())), 'yyyy-MM-dd', 'en');
                    param.dlvDate = formatDate(new Date(now.setDate(now.getDate() + 7)), 'yyyy-MM-dd', 'en');
                    param.soNo = null;
                    param.soAmt = 0;
                    param.status = 'N';
                    param.soCreDate = null;
                    if (param.deliveryDate === null) {
                        param.deliveryDate = '';
                    }
                    return param;
                });
                const rtnList = {
                    header: header,
                    detail: detail
                };
                this._matDialogRef.close(rtnList);

            });
        }

        // const confirmation = this._teamPlatConfirmationService.open({
        //     title : '',
        //     message: '선택하시겠습니까?',
        //     actions: {
        //         confirm: {
        //             label: '확인'
        //         },
        //         cancel: {
        //             label: '닫기'
        //         }
        //     }
        // });
        //
        // confirmation.afterClosed()
        //     .pipe(takeUntil(this._unsubscribeAll))
        //     .subscribe((result) => {
        //         if(result){
        //             console.log(result);
        //         }
        //     });
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }
}
