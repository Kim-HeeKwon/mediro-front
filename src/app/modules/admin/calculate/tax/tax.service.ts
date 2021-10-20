import {Injectable} from "@angular/core";
import {BehaviorSubject, Observable, of, throwError} from "rxjs";
import {InvoiceDetail, InvoiceDetailPagenation, InvoiceHeader, InvoiceHeaderPagenation} from "./tax.types";
import {HttpClient} from "@angular/common/http";
import {Common} from "../../../../../@teamplat/providers/common/common";
import {map, switchMap, take} from "rxjs/operators";
import {Bill} from "../bill/bill.types";
import {environment} from "../../../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class TaxService {
    private _invoiceHeader: BehaviorSubject<InvoiceHeader> = new BehaviorSubject(null);
    private _invoiceHeaders: BehaviorSubject<InvoiceHeader[]> = new BehaviorSubject(null);
    private _invoiceHeaderPagenation: BehaviorSubject<InvoiceHeaderPagenation | null> = new BehaviorSubject(null);
    private _invoiceDetail: BehaviorSubject<InvoiceDetail> = new BehaviorSubject(null);
    private _invoiceDetails: BehaviorSubject<InvoiceDetail[]> = new BehaviorSubject(null);
    private _invoiceDetailPagenation: BehaviorSubject<InvoiceDetailPagenation | null> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
                private _common: Common) {

    }

    /**
     * Getter for header
     */
    get invoiceHeader$(): Observable<InvoiceHeader>
    {
        return this._invoiceHeader.asObservable();
    }
    /**
     * Getter for headers
     */
    get invoiceHeaders$(): Observable<InvoiceHeader[]>
    {
        return this._invoiceHeaders.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get invoiceHeaderPagenation$(): Observable<InvoiceHeaderPagenation>
    {
        return this._invoiceHeaderPagenation.asObservable();
    }

    /**
     * Getter for header
     */
    get invoiceDetail$(): Observable<InvoiceDetail>
    {
        return this._invoiceDetail.asObservable();
    }
    /**
     * Getter for headers
     */
    get invoiceDetails$(): Observable<InvoiceDetail[]>
    {
        return this._invoiceDetails.asObservable();
    }

    /**
     * Getter for Header Pagenation
     */
    get invoiceDetailPagenation$(): Observable<InvoiceDetailPagenation>
    {
        return this._invoiceDetailPagenation.asObservable();
    }

    /**
     * Post getHeader
     *
     * @returns
     */
    getHeader(page: number = 0, size: number = 10, sort: string = 'invoice', order: 'asc' | 'desc' | '' = 'desc', search: any = {}):
        Observable<{ invoiceHeaderPagenation: InvoiceHeaderPagenation; invoiceHeader: InvoiceHeader[] }> {

        const searchParam = {};
        searchParam['order'] = order;
        searchParam['sort'] = sort;

        // 검색조건 Null Check
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
            this._common.sendDataWithPageNation(searchParam, pageParam, environment.serverTaxUrl + 'v1/api/calculate/tax/header-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._invoiceHeaders.next(response.data);
                        this._invoiceHeaderPagenation.next(response.pageNation);
                        resolve(this._invoiceHeaders);
                    }
                }, reject);
        });
    }

    /**
     * Get product by id
     */
    getInvoiceDetailById(invoice: string): Observable<InvoiceHeader>
    {
        return this._invoiceHeaders.pipe(
            take(1),
            map((products) => {

                const product = products.find(tax => tax.invoice === invoice) || null;

                // Update the product
                this._invoiceHeader.next(product);

                // Return the product
                return product;
            }),
            switchMap((product) => {

                if ( !product )
                {
                    return throwError('Could not found product with id of ' + invoice + '!');
                }

                return of(product);
            })
        );
    }

    /**
     * Post getDetail
     *
     * @returns
     */
    getDetail(page: number = 0, size: number = 10, sort: string = 'lineNo', order: 'asc' | 'desc' | '' = 'asc', search: any = {}):
        Observable<{ invoiceDetailPagenation: InvoiceDetailPagenation; invoiceDetail: InvoiceDetail[] }> {

        const searchParam = {};
        searchParam['order'] = order;
        searchParam['sort'] = sort;

        // 검색조건 Null Check
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
            this._common.sendDataWithPageNation(searchParam, pageParam, environment.serverTaxUrl + 'v1/api/calculate/tax/detail-List')
                .subscribe((response: any) => {
                    if (response.status === 'SUCCESS') {
                        this._invoiceHeader.next(search);
                        this._invoiceDetails.next(response.data);
                        this._invoiceDetailPagenation.next(response.pageNation);
                        resolve(this._invoiceDetails);
                    }
                }, reject);
        });
    }

    /**
     * 세금계산서 발행
     */
    invoice(invoiceHeaders: InvoiceHeader[]): Observable<InvoiceHeader>
    {
        return this.invoiceHeader$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(invoiceHeaders, environment.serverTaxUrl + 'v1/api/calculate/tax/invoice-issue').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }

    /**
     * 세금계산서 발행 취소
     */
    invoiceCancel(invoiceHeaders: InvoiceHeader[]): Observable<InvoiceHeader>
    {
        return this.invoiceHeader$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(invoiceHeaders, environment.serverTaxUrl + 'v1/api/calculate/tax/invoice-cancel').pipe(
                map((result) => {
                    if(result.status === 'SUCCESS'){
                    }
                    // Return the new product
                    return result;
                })
            ))
        );
    }

    /**
     * 세금계산서 삭제
     */
    invoiceDelete(invoiceHeaders: InvoiceHeader[]): Observable<InvoiceHeader>
    {
        return this.invoiceHeader$.pipe(
            take(1),
            switchMap(products => this._common.sendListData(invoiceHeaders, environment.serverTaxUrl + 'v1/api/calculate/tax/invoice-delete').pipe(
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
