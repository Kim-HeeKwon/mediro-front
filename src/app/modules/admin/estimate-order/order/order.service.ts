import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';
import {Common} from '../../../../../@teamplat/providers/common/common';
import {Order, OrderDetail, OrderDetailPagenation, OrderHeader, OrderHeaderPagenation} from './order.types';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private _orderHeader: BehaviorSubject<OrderHeader> = new BehaviorSubject(null);
    private _orderHeaders: BehaviorSubject<OrderHeader[]> = new BehaviorSubject(null);
    private _orderHeaderPagenation: BehaviorSubject<OrderHeaderPagenation | null> = new BehaviorSubject(null);
    private _orderDetail: BehaviorSubject<OrderDetail> = new BehaviorSubject(null);
    private _orderDetails: BehaviorSubject<OrderDetail[]> = new BehaviorSubject(null);
    private _orderDetailPagenation: BehaviorSubject<OrderDetailPagenation | null> = new BehaviorSubject(null);
    private _orders: BehaviorSubject<Order[]> = new BehaviorSubject(null);

    /**
     * Getter for Header
     */
    get orderHeader$(): Observable<OrderHeader>
    {
        return this._orderHeader.asObservable();
    }
    /**
     * Getter for Header
     */
    get orderHeaders$(): Observable<OrderHeader[]>
    {
        return this._orderHeaders.asObservable();
    }
    /**
     * Getter for Header Pagenation
     */
    get orderHeaderPagenation$(): Observable<OrderHeaderPagenation>
    {
        return this._orderHeaderPagenation.asObservable();
    }

    /**
     * Getter for Detail
     */
    get orderDetails$(): Observable<OrderDetail[]>
    {
        return this._orderDetails.asObservable();
    }
    /**
     * Getter for Detail Pagenation
     */
    get orderDetailPagenation$(): Observable<OrderDetailPagenation>
    {
        return this._orderDetailPagenation.asObservable();
    }

    /**
     * Getter
     */
    get orders$(): Observable<Order[]>
    {
        return this._orders.asObservable();
    }
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 10, sort: string = 'poNo', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Observable<{ orderHeaderPagenation: OrderHeaderPagenation; orderHeader: OrderHeader[] }> {

        const searchParam = {};
        searchParam['order'] = order;
        searchParam['sort'] = sort;

        // ???????????? Null Check
        if ((Object.keys(search).length === 0) === false) {
            // eslint-disable-next-line guard-for-in
            for (const k in search) {
                searchParam[k] = search[k];
            }
        }
        if(searchParam['start'] === undefined){
            if(searchParam['end'] === undefined){
                searchParam['start'] = moment().utc(false).add(-7, 'day').endOf('day').toISOString();
                searchParam['end'] =  moment().utc(false).startOf('day').toISOString();
            }
        }

        const pageParam = {
            page: page,
            size: size,
        };

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/estimateOrder/order/header-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._orderHeaders.next(response.data);
                        this._orderHeaderPagenation.next(response.pageNation);
                        resolve(this._orderHeaders);
                    }
                }, reject);
        });
    }

    /**
     * Post getDetail
     *
     * @returns
     */
    getDetail(page: number = 0, size: number = 10, sort: string = 'itemCd', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ orderDetailPagenation: OrderDetailPagenation; orderDetail: OrderDetail[] }> {

        const searchParam = {};
        searchParam['order'] = order;
        searchParam['sort'] = sort;

        // ???????????? Null Check
        if ((Object.keys(search).length === 0) === false) {
            // eslint-disable-next-line guard-for-in
            for (const k in search) {
                searchParam[k] = search[k];
            }
        }

        const pageParam = {
            page: page,
            size: size,
        };

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._common.sendDataWithPageNation(searchParam, pageParam, 'v1/api/estimateOrder/order/detail-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._orderDetails.next(response.data);
                        this._orderDetailPagenation.next(response.pageNation);
                        resolve(this._orderDetails);
                    }
                }, reject);
        });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    totalAmt(order: Order[]): Observable<{order: Order[]}> {
        return this._common.put('v1/api/estimateOrder/order/order-total-amt', order).pipe(
            switchMap((response: any) => of(response))
        );
    }

    /**
     * Create
     */
    createOrder(order: Order[]): Observable<Order>
    {
        return this.orders$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(order, 'v1/api/estimateOrder/order').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }

    updateOrder(order: Order[]): Observable<{order: Order[] }> {

        return this._common.listPut('v1/api/estimateOrder/order', order).pipe(
            switchMap((response: any) => of(response))
        );
    }
    deleteOrder(order: Order[]): Observable<{order: Order[]}> {

        return this._common.listDelete('v1/api/estimateOrder/order', order).pipe(
            switchMap((response: any) => of(response))
        );
        // @ts-ignore
        // return new Promise((resolve, reject) => {
        //     this._common.delete('v1/api/basicInfo/account', accountData)
        //         .subscribe((response: any) => {
        //             this.getAccount();
        //         }, reject);
        // });
    }

    /**
     * Post getNew
     *
     * @returns
     */
    getNew(page: number = 0, size: number = 10, sort: string = 'itemCd', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ orderDetailPagenation: OrderDetailPagenation; orderDetail: OrderDetail[] }> {

        const searchParam = {};
        searchParam['order'] = order;
        searchParam['sort'] = sort;

        // ???????????? Null Check
        if ((Object.keys(search).length === 0) === false) {
            // eslint-disable-next-line guard-for-in
            for (const k in search) {
                searchParam[k] = search[k];
            }
        }

        const pageParam = {
            page: page,
            size: size,
        };

        // @ts-ignore
        return new Promise((resolve, reject) => {
            this._orderDetails.next([]);
            // @ts-ignore
            this._orderDetailPagenation.next([]);
        });
    }

    orderConfirm(orders: Order[]): Observable<Order>
    {
        return this.orders$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(orders, 'v1/api/estimateOrder/order/confirm').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }
    orderDetailConfirm(orders: Order[]): Observable<Order>
    {
        return this.orders$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(orders, 'v1/api/estimateOrder/order/confirm-detail').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }

    orderSend(orders: Order[]): Observable<Order>
    {
        return this.orders$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(orders, 'v1/api/estimateOrder/order/send').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }

    orderCancel(orders: Order[]): Observable<Order>
    {
        return this.orders$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(orders, 'v1/api/estimateOrder/order/cancel').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }
}
