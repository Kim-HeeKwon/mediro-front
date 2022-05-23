import {AfterViewInit, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {fuseAnimations} from "../../../animations";
import {DeviceDetectorService} from "ngx-device-detector";
import {takeUntil} from "rxjs/operators";
import {Observable, Subject} from "rxjs";
import {NoticeBoardService} from "../notice-board.service";

@Component({
    selector: 'app-detail-notice-board-list',
    templateUrl: './detail-notice-board.component.html',
    styleUrls: ['./detail-notice-board.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})

export class DetailNoticeBoardComponent implements OnInit, OnDestroy, AfterViewInit {
    textPrev: boolean;
    textNext: boolean;
    isMobile: boolean = false;
    prevNo: any;
    nextNo: any;
    nbNo: any;
    title: any;
    addUser: any;
    addDate: Date;
    comment: any;
    cnt: any;
    no: any;
    detail: any;
    prev: any;
    next: any;

    private _unsubscribeAll: Subject<any> = new Subject<any>();
    constructor(
        public matDialogRef: MatDialogRef<DetailNoticeBoardComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private _noticeService: NoticeBoardService,
        private _deviceService: DeviceDetectorService,
        private _changeDetectorRef: ChangeDetectorRef,)
    {
        this.isMobile = this._deviceService.isMobile();
        if(data) {
            this.nbNo = data.nbNo;
            this.title = data.title;
            this.addUser = data.addUser;
            this.addDate = data.addDate;
            this.comment = data.comment;
            this.cnt = data.cnt;
            this.detail = data.details;
            this.no = data.no;
        }

    }
    ngOnInit(): void {
        if(this.nbNo) {
            if (this.nbNo === '1') {
                this.prev = '이전글이 없습니다.';
            } else if (Number(this.nbNo) === this.detail.length) {
                this.next = '다음글이 없습니다.';
            }
            for(let i = 0; i < this.detail.length; i++) {
                if(this.nbNo === this.detail[i].nbNo){
                    this.nextNo = Number(this.detail[i].nbNo) + 1;
                }
            }
            for(let i = 0; i < this.detail.length; i++) {
                if (this.detail[i].nbNo === String(this.nextNo)) {
                    this.next = this.detail[i].title;
                }
            }
            for(let i = 0; i < this.detail.length; i++) {
                if(this.nbNo === this.detail[i].nbNo){
                    this.prevNo = Number(this.detail[i].nbNo) - 1;
                }
            }
            for(let i = 0; i < this.detail.length; i++) {
                if (this.detail[i].nbNo === String(this.prevNo)) {
                    this.prev = this.detail[i].title;
                }
            }
        }
        if(this.prev === '이전글이 없습니다.') {
            this.textPrev = true;
        } else {
            this.textPrev = false;
        }
        if(this.next === '다음글이 없습니다.') {
            this.textNext = true;
        } else {
            this.textNext = false;
        }
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    nextNotice(val: any): void {
        if(val !== '다음글이 없습니다.') {
            for(let i = 0; i < this.detail.length; i++) {
                if(this.detail[i].title === val) {
                    this.title = this.detail[i].title;
                    this.addUser = this.detail[i].addUser;
                    this.addDate = this.detail[i].addDate;
                    this.cnt = this.detail[i].cnt;
                    this.comment = this.detail[i].comment;
                    this.nbNo = this.detail[i].nbNo;
                    if (this.nbNo === '1') {
                        this.prev = '이전글이 없습니다.';
                    } else if (Number(this.nbNo) === this.detail.length) {
                        this.next = '다음글이 없습니다.';
                    }
                    for(let i = 0; i < this.detail.length; i++) {
                        if(this.nbNo === this.detail[i].nbNo){
                            this.nextNo = Number(this.detail[i].nbNo) + 1;
                        }
                    }
                    for(let i = 0; i < this.detail.length; i++) {
                        if (this.detail[i].nbNo === String(this.nextNo)) {
                            this.next = this.detail[i].title;
                        }
                    }
                    for(let i = 0; i < this.detail.length; i++) {
                        if(this.nbNo === this.detail[i].nbNo){
                            this.prevNo = Number(this.detail[i].nbNo) - 1;
                        }
                    }
                    for(let i = 0; i < this.detail.length; i++) {
                        if (this.detail[i].nbNo === String(this.prevNo)) {
                            this.prev = this.detail[i].title;
                        }
                    }
                    if(this.prev === '이전글이 없습니다.') {
                        this.textPrev = true;
                    } else {
                        this.textPrev = false;
                    }
                    if(this.next === '다음글이 없습니다.') {
                        this.textNext = true;
                    } else {
                        this.textNext = false;
                    }
                }
            }
        }
    }

    prevNotice(val: any): void {
        if(val !== '이전글이 없습니다.') {
            for (let i = 0; i < this.detail.length; i++) {
                if (this.detail[i].title === val) {
                    this.title = this.detail[i].title;
                    this.addUser = this.detail[i].addUser;
                    this.addDate = this.detail[i].addDate;
                    this.cnt = this.detail[i].cnt;
                    this.comment = this.detail[i].comment;
                    this.nbNo = this.detail[i].nbNo;
                    if (this.nbNo === '1') {
                        this.prev = '이전글이 없습니다.';
                    } else if (Number(this.nbNo) === this.detail.length) {
                        this.next = '다음글이 없습니다.';
                    }
                    for(let i = 0; i < this.detail.length; i++) {
                        if(this.nbNo === this.detail[i].nbNo){
                            this.nextNo = Number(this.detail[i].nbNo) + 1;
                        }
                    }
                    for(let i = 0; i < this.detail.length; i++) {
                        if (this.detail[i].nbNo === String(this.nextNo)) {
                            this.next = this.detail[i].title;
                        }
                    }
                    for(let i = 0; i < this.detail.length; i++) {
                        if(this.nbNo === this.detail[i].nbNo){
                            this.prevNo = Number(this.detail[i].nbNo) - 1;
                        }
                    }
                    for(let i = 0; i < this.detail.length; i++) {
                        if (this.detail[i].nbNo === String(this.prevNo)) {
                            this.prev = this.detail[i].title;
                        }
                    }
                    if(this.prev === '이전글이 없습니다.') {
                        this.textPrev = true;
                    } else {
                        this.textPrev = false;
                    }
                    if(this.next === '다음글이 없습니다.') {
                        this.textNext = true;
                    } else {
                        this.textNext = false;
                    }
                }
            }
        }
    }
}
