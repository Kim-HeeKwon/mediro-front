import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from "@angular/core";
import {FuseAlertType} from "../../../../../../@teamplat/components/alert";
import {Subject} from "rxjs";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {TeamPlatConfirmationService} from "../../../../../../@teamplat/services/confirmation";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {SessionStore} from "../../../../../core/session/state/session.store";
import {FunctionService} from "../../../../../../@teamplat/services/function";
import {DeviceDetectorService} from "ngx-device-detector";
import {CodeStore} from "../../../../../core/common-code/state/code.store";
import {FuseUtilsService} from "../../../../../../@teamplat/services/utils";
import {Common} from "../../../../../../@teamplat/providers/common/common";
import {BreakpointObserver} from "@angular/cdk/layout";
import {FlatTreeControl} from "@angular/cdk/tree";
import {MatTreeFlatDataSource, MatTreeFlattener} from "@angular/material/tree";

interface PlatFormPrice {
    id: string;
    name: string;
    name2?: string;
    price?: string;
    line? : string;
    children?: PlatFormPrice[];
}

interface ExampleFlatNode {
    id: string;
    expandable: boolean;
    name: string;
    name2?: string;
    line? : string;
    price?: string;
    level: number;
}
const TREE_DATA: PlatFormPrice[] = [
    {
        id: '',
        name: '사용료',
        name2: '기본, 월 결제',
        price: '48,000 원',
        children: [
            {
                id: '',
                name: '품목판매건수:700건/월, 공급내역보고:100건/월, 전자세금계산서:50건/월, 플랫폼 사용자:3명'
                , price: '48,000 원', line: '1'},
        ]
    },
    {
        id: '',
        name: '품목 판매 건수 (80원/건)',
        price: '0 원',
        children: [
            {
                id: '',
                name: '품목 판매 건수는 매월 700건까지 무료입니다.', name2: '650 건', price: '0 원', line: '1'},
        ]
    }, {
        id: '',
        name: '공급내역 보고 건수 (150원/건)',
        price: '0 원',
        children: [
            {
                id: '',
                name: '공급내역 보고는 매월 100건까지 무료입니다.', name2: '80 건', price: '0 원', line: '1'},
        ]
    },
    {
        id: '',
        name: '전자세금계산서 건수 (100원/건)',
        price: '52,000 원',
        children: [
            {
                id: '',
                name: '전자세금계산서는 매월 50건까지 무료입니다.', name2: '570 건', price: '52,000 원', line: '1'},
        ]
    },
    {
        id: '',
        name: '플랫폼 사용자 수 (10,000원/명)',
        price: '0 원',
        children: [
            {
                id: '',
                name: '플랫폼 사용자는 3명까지 무료입니다. 3명 초과 시 매월 부과됩니다.', name2: '2 명', price: '0 원', line: '1'},
        ]
    },
];


@Component({
    selector       : 'settings-billing',
    templateUrl    : './billing.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsBillingComponent implements OnInit
{
    isMobile: boolean = false;
    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    billingForm: FormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    billingDay: any = [];
    private _transformer = (node: PlatFormPrice, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            id: node.id,
            name: node.name,
            name2: node.name2,
            price: node.price,
            line: node.line,
            level: level,
        };
    };
    treeControl = new FlatTreeControl<ExampleFlatNode>(
        node => node.level, node => node.expandable);

    treeFlattener = new MatTreeFlattener(
        this._transformer, node => node.level, node => node.expandable, node => node.children);

    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    hasChild = (_: number, node: ExampleFlatNode) => node.expandable;
    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _matDialog: MatDialog,
        private _teamPlatConfirmationService: TeamPlatConfirmationService,
        private _formBuilder: FormBuilder,
        private _changeDetectorRef: ChangeDetectorRef,
        private _sessionStore: SessionStore,
        private _functionService: FunctionService,
        private _deviceService: DeviceDetectorService,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService,
        private _common: Common,
        private readonly breakpointObserver: BreakpointObserver
    )
    {
        const treeData = this.getBillingInfo();
        this.isMobile = this._deviceService.isMobile();
        this.billingDay = [{
            id: '2022-03',
            name : '3월 2022년',
            no : '1',
        },{
            id: '2022-02',
            name : '2월 2022년',
            no : '2',
        }];
    }

    ngOnInit(): void {
        // 검색 Form 생성
        const today = new Date();
        const YYYY = today.getFullYear();
        const mm = today.getMonth()+1; //January is 0!
        let MM;
        if(mm<10) {
            MM = String('0'+mm);
        }else{
            MM = String(mm);
        }
        // Create the form
        this.billingForm = this._formBuilder.group({
                billingDay     : [YYYY+ '-'+ MM, [Validators.required]],
            }
        );
    }

    excel() {

    }

    print() {

    }

    getBillingInfo(){

        const param = {
            mId: this._sessionStore.getValue().businessNumber
        };

        let treeData: PlatFormPrice[];
        this._common.sendData(param,'/v1/api/payment/get-billing-info')
            .subscribe((responseData: any) => {
                if(!this._common.gfn_isNull(responseData.data)){
                    console.log(responseData.data[0]);
                    let totalAmt = 0;
                    totalAmt += responseData.data[0].baseFee;
                    let yearUser = '월';
                    if(responseData.data[0].yearUser){
                        yearUser = '연';
                    }
                    let payGrade = '기본';
                    if(responseData.data[0].payGrade === 'premium'){
                        payGrade = '프리미엄';
                    }
                    let salesOfferQty = '품목판매건수 무제한';
                    if(responseData.data[0].salesOfferQty !== '-'){
                        salesOfferQty = '품목판매건수:' + responseData.data[0].salesOfferQty + '건/월';
                    }
                    let udiOfferQty = '공급내역보고 무제한';
                    if(responseData.data[0].udiOfferQty !== '-'){
                        udiOfferQty  = '공급내역보고:' + responseData.data[0].udiOfferQty + '건/월';
                    }
                    let invoiceOfferQty = '전자세금계산서 무제한';
                    if(responseData.data[0].invoiceOfferQty !== '-'){
                        invoiceOfferQty  = '전자세금계산서:' + responseData.data[0].invoiceOfferQty + '건/월';
                    }
                    let userOfferQty = '플랫폼 사용자 무제한';
                    if(responseData.data[0].userOfferQty !== '-'){
                        userOfferQty  = '플랫폼 사용자:' + responseData.data[0].userOfferQty + '명';
                    }

                    let AllOfferQty = salesOfferQty + ', ' + udiOfferQty + ', ' + invoiceOfferQty + ', ' + userOfferQty + '';
                    treeData = [
                        {
                            id: '',
                            name: '사용료',
                            name2: payGrade + ', ' + yearUser + ' 결제',
                            price: this.numberFormat(responseData.data[0].baseFee) +' 원',
                            children: [
                                {
                                    id: '',
                                    name: AllOfferQty
                                    // name: '품목판매건수:700건/월, 공급내역보고:100건/월, 전자세금계산서:50건/월, 플랫폼 사용자:3명'
                                    , price: this.numberFormat(responseData.data[0].baseFee) + ' 원', line: '1'},
                            ]
                        },
                        {
                            id: '',
                            name: '품목 판매 건수 (' + this.numberFormat(responseData.data[0].salesUnitPrice) + '원/건)',
                            price: '0 원',
                            children: [
                                {
                                    id: '',
                                    name: '품목 판매 건수는 매월 ' + this.numberFormat(responseData.data[0].salesOfferQty) + '건까지 무료입니다.', name2: '650 건', price: '0 원', line: '1'},
                            ]
                        }, {
                            id: '',
                            name: '공급내역 보고 건수 (' + this.numberFormat(responseData.data[0].udiUnitPrice) + '원/건)',
                            price: '0 원',
                            children: [
                                {
                                    id: '',
                                    name: '공급내역 보고는 매월 ' + this.numberFormat(responseData.data[0].udiOfferQty) + '건까지 무료입니다.', name2: '80 건', price: '0 원', line: '1'},
                            ]
                        },
                        {
                            id: '',
                            name: '전자세금계산서 건수 (' + this.numberFormat(responseData.data[0].invoiceUnitPrice) + '원/건)',
                            price: '52,000 원',
                            children: [
                                {
                                    id: '',
                                    name: '전자세금계산서는 매월 ' + this.numberFormat(responseData.data[0].invoiceOfferQty) + '건까지 무료입니다.', name2: '570 건', price: '52,000 원', line: '1'},
                            ]
                        },
                        {
                            id: '',
                            name: '플랫폼 사용자 수 (' + this.numberFormat(responseData.data[0].userUnitPrice) + '원/명)',
                            price: '0 원',
                            children: [
                                {
                                    id: '',
                                    name: '플랫폼 사용자는 ' + this.numberFormat(responseData.data[0].userOfferQty) + '명까지 무료입니다. ' + this.numberFormat(responseData.data[0].userOfferQty) + '명 초과 시 매월 부과됩니다.', name2: '2 명', price: '0 원', line: '1'},
                            ]
                        },
                    ];

                    this.dataSource.data = treeData;
                }
            });
    }

    numberFormat(num): number{
        return num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    }
}