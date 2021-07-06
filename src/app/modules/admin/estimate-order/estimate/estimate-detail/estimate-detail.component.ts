import {ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {fuseAnimations} from '../../../../../../@teamplat/animations';
import {EstimateDetail, EstimateHeader} from '../estimate.types';
import {ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CommonCode, CommonPopup, FuseUtilsService} from '../../../../../../@teamplat/services/utils';
import {CodeStore} from '../../../../../core/common-code/state/code.store';

@Component({
    selector       : 'estimate-detail',
    templateUrl    : './estimate-detail.component.html',
    styleUrls: ['./estimate-detail.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations   : fuseAnimations
})
export class EstimateDetailComponent implements OnInit
{
    isLoading: boolean = false;
    estimateHeader: EstimateHeader;
    estimateHeaderForm: FormGroup;
    flashMessage: 'success' | 'error' | null = null;

    type: CommonCode[] = null;
    status: CommonCode[] = null;
    filterList: string[];

    displayedColumns: string[] ;
    dataSource: any[] = [];
    val: any;
    constructor(
        private _router: Router,
        private _activatedRoute: ActivatedRoute,
        private _formBuilder: FormBuilder,
        private _codeStore: CodeStore,
        private _utilService: FuseUtilsService)
    {
        this.filterList = ['ALL'];
        this.type = _utilService.commonValueFilter(_codeStore.getValue().data,'QT_TYPE', this.filterList);
        this.status = _utilService.commonValueFilter(_codeStore.getValue().data,'QT_STATUS', this.filterList);
    }
    /**
     * On init
     */
    ngOnInit(): void
    {
        // 고객사 Form 생성
        this.estimateHeaderForm = this._formBuilder.group({
            //mId: ['', [Validators.required]],     // 회원사
            qtNo: [''],   // 견적번호
            account: ['', [Validators.required]], // 거래처 코드
            accountNm: [''],   // 거래처 명
            type: ['', [Validators.required]],   // 유형
            status: ['', [Validators.required]],   // 상태
            qtAmt: [''],   // 견적금액
            soNo: [''],   // 주문번호
            qtCreDate: [''],//견적 생성일자
            qtDate: [''], //견적일자
            remarkHeader: [''], //비고
            active: [false]  // cell상태
        });
        if(this._activatedRoute.snapshot.paramMap['params'].length !== (null || undefined)){
            this.estimateHeaderForm.patchValue(this._activatedRoute.snapshot.paramMap['params']);
        }else{

        }
    }

    backPage(): void{
        this._router.navigate(['estimate-order/estimate']);
    }
    createEstimate(): void{

    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    pasteData(event: ClipboardEvent) {
        const clipboardData = event.clipboardData;
        const pastedText = clipboardData.getData('text');
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const row_data = pastedText.split('\n');
        this.displayedColumns = row_data[0].split('\t');
        delete row_data[0];
        // Create table dataSource
        const data=[];

        // eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-shadow
        row_data.forEach((row_data)=>{
            const row={};
            this.displayedColumns.forEach((a, index)=>{row[a]= row_data.split('\t')[index];});
            data.push(row);
        });
        this.dataSource = data;

        console.log(this.dataSource);
    }
}
