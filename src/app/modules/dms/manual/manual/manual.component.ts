import {ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDrawer} from '@angular/material/sidenav';
import {Subject} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {FuseMediaWatcherService} from '../../../../../@teamplat/services/media-watcher';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'app-manual',
    templateUrl: './manual.component.html',
    styleUrls: ['./manual.component.scss']
})
// eslint-disable-next-line @typescript-eslint/naming-convention
export class manualComponent implements OnInit, OnDestroy {
    @ViewChild('drawer') drawer: MatDrawer;
    drawerMode: 'over' | 'side' = 'side';
    drawerOpened: boolean = true;
    panels: any[] = [];
    selectedPanel: string = 'basicInfo';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseMediaWatcherService: FuseMediaWatcherService) {
    }

    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        if(this._route.snapshot.paramMap.get('id') !== null){
            this.goToPanel(this._route.snapshot.paramMap.get('id'));
        }
        this.panels = [
            {
                id         : 'basicInfo',
                icon       : 'info',
                title      : '기준 정보',
                description: '거래처, 품목, 단가 매뉴'
            },
            {
                id         : 'circulation',
                icon       : 'local_shipping',
                title      : '유통 관리',
                description: '견적, 발주, 주문, 입고, 출고, 재고, 정산 및 마감, 계산서 발행 매뉴얼'
            },
            {
                id         : 'udi',
                icon       : 'insert_chart',
                title      : '공급내역 보고',
                description: '공급내역 보고, 공급내역 전송 매뉴얼'
            },
            {
                id         : 'smartPlus',
                icon       : 'playlist_add',
                title      : '스마트 플러스',
                description: '자동발주, 정기주문, 안전재고, 유효기간, 장기재고, 가납재고 매뉴얼'
            },
            {
                id         : 'etc',
                icon       : 'heroicons_outline:credit-card',
                title      : '기타',
                description: '액셀, 그리드, 이메일 회신 매뉴얼'
            },
        ];

        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) => {

                // Set the drawerMode and drawerOpened
                if ( matchingAliases.includes('lg') )
                {
                    this.drawerMode = 'side';
                    this.drawerOpened = true;
                }
                else
                {
                    this.drawerMode = 'over';
                    this.drawerOpened = false;
                }

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    goToPanel(panel: string): void
    {
        this.selectedPanel = panel;

        // Close the drawer on 'over' mode
        if ( this.drawerMode === 'over' )
        {
            this.drawer.close();
        }
    }

    getPanelInfo(id: string): any
    {
        return this.panels.find(panel => panel.id === id);
    }
}
