import { Injectable } from '@angular/core';
import { IsActiveMatchOptions } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class FuseUtilsService
{
    /**
     * Constructor
     */
    constructor()
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the equivalent "IsActiveMatchOptions" options for "exact = true".
     */
    get exactMatchOptions(): IsActiveMatchOptions
    {
        return {
            paths       : 'exact',
            fragment    : 'ignored',
            matrixParams: 'ignored',
            queryParams : 'exact'
        };
    }

    /**
     * Get the equivalent "IsActiveMatchOptions" options for "exact = false".
     */
    get subsetMatchOptions(): IsActiveMatchOptions
    {
        return {
            paths       : 'subset',
            fragment    : 'ignored',
            matrixParams: 'ignored',
            queryParams : 'subset'
        };
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Generates a random id
     *
     * @param length
     */
    randomId(length: number = 10): string
    {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let name = '';

        for ( let i = 0; i < 10; i++ )
        {
            name += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return name;
    }

    /**
     * Generates a random id
     *
     * @param commonCode
     */
    commonValue(commonCode: any[], value: string): any  // CommonCode[]
    {
        const commonValues: CommonCode[] = [];

        const childValues = commonCode.filter((item: any) => item.mainCd === value).map((param: any) => {
            return param.child;
        });

        childValues[0].forEach((param1: any) => {
            const commonValue: CommonCode = {
                id : param1.subCd,
                name : param1.descr
            };
            commonValues.push(commonValue);
        });
        return commonValues;
    }

}

export interface CommonCode
{
    id: string;         //ID
    name: string;       //NAME
}
