import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {merge, Observable, Subject} from 'rxjs';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {Validity, ValidityPagenation} from './validity.types';
import {FormBuilder, FormGroup} from '@angular/forms';
import {CommonCode, FuseUtilsService} from '../../../../../@teamplat/services/utils';
import {CodeStore} from '../../../../core/common-code/state/code.store';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {ValidityService} from './validity.service';
import RealGrid, {DataFieldObject, ValueType} from 'realgrid';
import {Columns} from '../../../../../@teamplat/services/realgrid/realgrid.types';
import {FuseRealGridService} from '../../../../../@teamplat/services/realgrid';

@Component({
    selector: 'dms-app-validity',
    templateUrl: './validity.component.html',
    styleUrls: ['./validity.component.scss']
})
export class ValidityComponent implements OnInit, OnDestroy, AfterViewInit  {
    @ViewChild(MatPaginator) private _paginator: MatPaginator;
    drawerMode: 'over' | 'side' = 'over';
    drawerOpened: boolean = false;
    isLoading: boolean = false;
    orderBy: any = 'asc';
    isMobile: boolean = false;
    navigationSubscription: any;
    searchForm: FormGroup;
    validity: CommonCode[] = null;
    itemGrades: CommonCode[] = null;
    validitys$: Observable<Validity[]>;
    validityPagenation: ValidityPagenation | null = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    searchCondition: CommonCode[] = [
        {
            id: '100',
            name: '품목 명'
        }];

    // @ts-ignore
    gridList: RealGrid.GridView;
    // @ts-ignore
    validityDataProvider: RealGrid.LocalDataProvider;
    validityColumns: Columns[];
    // @ts-ignore
    validityFields: DataFieldObject[] = [
        {fieldName: 'itemCd', dataType: ValueType.TEXT},
        {fieldName: 'itemNm', dataType: ValueType.TEXT},
        {fieldName: 'itemGrade', dataType: ValueType.TEXT},
        {fieldName: 'standard', dataType: ValueType.TEXT},
        {fieldName: 'unit', dataType: ValueType.TEXT},
        {fieldName: 'lot2', dataType: ValueType.TEXT},
        {fieldName: 'validity', dataType: ValueType.TEXT},
        {fieldName: 'qty', dataType: ValueType.TEXT},
        {fieldName: 'availQty', dataType: ValueType.TEXT}
    ];
    constructor(
        private _realGridsService: FuseRealGridService,
        private _validityService: ValidityService,
        private _formBuilder: FormBuilder,
        private _utilService: FuseUtilsService,
        private _router: Router,
        private _changeDetectorRef: ChangeDetectorRef,
        private _codeStore: CodeStore,
        private _deviceService: DeviceDetectorService,)
    {
        this.validity = _utilService.commonValue(_codeStore.getValue().data,'INV_VALIDITY');
        this.itemGrades = _utilService.commonValue(_codeStore.getValue().data,'ITEM_GRADE');
        this.navigationSubscription = this._router.events.subscribe((e: any) => {
            // RELOAD로 설정했기때문에 동일한 라우트로 요청이 되더라도
            // 네비게이션 이벤트가 발생한다. 우리는 이 네비게이션 이벤트를 구독하면 된다.
            if (e instanceof NavigationEnd) {
            }
        });
        this.isMobile = this._deviceService.isMobile();
    }
    ngAfterViewInit(): void {
            // Get products if sort or page changes
            merge(this._paginator.page).pipe(
                switchMap(() => {
                    this.isLoading = true;
                    // eslint-disable-next-line max-len
                    return this._validityService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'itemNm', this.orderBy, this.searchForm.getRawValue());
                }),
                map(() => {
                    this.isLoading = false;
                })
            ).subscribe();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._realGridsService.gfn_Destory(this.gridList, this.validityDataProvider);
    }

    ngOnInit(): void {

        const values = [];
        const lables = [];
        this.itemGrades.forEach((param: any) => {
            values.push(param.id);
            lables.push(param.name);
        });

        // 검색 Form 생성
        this.searchForm = this._formBuilder.group({
            type: ['ALL'],
            validity: ['ALL'],
            itemNm: [''],
            searchCondition: ['100'],
            searchText: [''],
        });

        this.validityColumns = [
            {
                name: 'itemCd', fieldName: 'itemCd', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목코드', styleName: 'left-cell-text'}
            },
            {name: 'itemNm', fieldName: 'itemNm', type: 'data', width: '150', styleName: 'left-cell-text'
                , header: {text: '품목명' , styleName: 'left-cell-text'},},
            {name: 'itemGrade', fieldName: 'itemGrade', type: 'data', width: '100', styleName: 'left-cell-text',
                header: {text: '품목등급', styleName: 'left-cell-text'},
                values: values,
                labels: lables,
                lookupDisplay: true,
            },
            {name: 'standard', fieldName: 'standard', type: 'data', width: '100', styleName: 'left-cell-text', header: {text: '규격' , styleName: 'left-cell-text'},
            },
            {name: 'unit', fieldName: 'unit', type: 'data', width: '100', styleName: 'left-cell-text', header: {text: '단위' , styleName: 'left-cell-text'}},
            {name: 'lot2', fieldName: 'lot2', type: 'data', width: '100', styleName: 'left-cell-text', header: {text: '유효기간 일자' , styleName: 'left-cell-text'}},
            {name: 'validity', fieldName: 'validity', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '유효기간' , styleName: 'left-cell-text'}},
            {name: 'qty', fieldName: 'qty'
                , type: 'data', width: '100', styleName: 'right-cell-text', header: {text: '현재고' , styleName: 'left-cell-text'}},
            {name: 'availQty', fieldName: 'availQty', type: 'data', width: '100', styleName: 'right-cell-text'
                , header: {text: '가용재고' , styleName: 'left-cell-text'}}
        ];

        this.validityDataProvider = this._realGridsService.gfn_CreateDataProvider();

        const gridListOption = {
            stateBar : false,
            checkBar : true,
            footers : false,
        };

        this.validityDataProvider.setOptions({
            softDeleting: false,
            deleteCreated: false
        });

        this.gridList = this._realGridsService.gfn_CreateGrid(
            this.validityDataProvider,
            'validity',
            this.validityColumns,
            this.validityFields,
            gridListOption);

        this.gridList.setEditOptions({
            readOnly: true,
            insertable: false,
            appendable: false,
            editable: false,
            deletable: false,
            checkable: true,
            softDeleting: false,
        });

        this.gridList.deleteSelection(true);
        this.gridList.setDisplayOptions({liveScroll: false,});
        this.gridList.setPasteOptions({enabled: false,});

        // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
        this.gridList.onCellClicked = (grid, clickData) => {
            if(clickData.cellType === 'header'){
                this._validityService.getHeader(this.validityPagenation.page,this.validityPagenation.size,clickData.column,this.orderBy,this.searchForm.getRawValue());
            };
            if(this.orderBy === 'asc'){
                this.orderBy = 'desc';
            }else{
                this.orderBy = 'asc';
            }
        };

        this.validitys$ = this._validityService.validitys$;
        this._validityService.validitys$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((validity: any) => {
                if(validity !== null){
                    this._realGridsService.gfn_DataSetGrid(this.gridList, this.validityDataProvider, validity);
                }
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this._validityService.validityPagenation$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((validityPagenation: ValidityPagenation) => {
                this.validityPagenation = validityPagenation;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }
    selectHeader(): void
    {
        if(this.searchForm.getRawValue().searchCondition === '100') {
            this.searchForm.patchValue({'itemCd': ''});
            this.searchForm.patchValue({'itemNm': this.searchForm.getRawValue().searchText});
        }
        this._validityService.getHeader(0,10,'itemNm','desc',this.searchForm.getRawValue());
    }

    //페이징
    pageEvent($event: PageEvent): void {
        this._validityService.getHeader(this._paginator.pageIndex, this._paginator.pageSize, 'itemNm', this.orderBy, this.searchForm.getRawValue());
    }
}
