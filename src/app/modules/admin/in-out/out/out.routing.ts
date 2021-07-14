import {ActivatedRouteSnapshot, Route, UrlMatchResult, UrlSegment} from '@angular/router';
import {isEqual} from 'lodash-es';
import {OutHeaderComponent} from './out-header/out-header.component';
import {OutComponent} from './out.component';
import {OutDetailComponent} from './out-detail/out-detail.component';
import {OutDetailResolver, OutResolver} from './out.resolvers';
import {OutNewComponent} from "./out-new/out-new.component";
import {EstimateNewComponent} from "../../estimate-order/estimate/estimate-new/estimate-new.component";
import {EstimateNewResolvers} from "../../estimate-order/estimate/estimate-new/estimate-new.resolvers";
import {OutNewResolvers} from "./out-new/out-new.resolvers";

/**
 * Mailbox custom route matcher
 *
 * @param url
 */
export const outComponentRouteMatcher: (url: UrlSegment[]) => UrlMatchResult = (url: UrlSegment[]) => {

    // Prepare consumed url and positional parameters
    let consumed = url;
    const posParams = {};

    posParams['folder'] = url[0];
    posParams['page'] = url[1];

    // Remove the id if exists
    if ( url[2] )
    {
        consumed = url.slice(0, -1);
    }

    return {
        consumed,
        posParams
    };
};

export const outComponentRunGuardsAndResolvers: (from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => boolean = (from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => {

    // Get activated route of the 'from'
    let fromCurrentRoute = from;
    while ( fromCurrentRoute.firstChild )
    {
        fromCurrentRoute = fromCurrentRoute.firstChild;
    }

    // Get the current activated route of the 'to'
    let toCurrentRoute = to;
    while ( toCurrentRoute.firstChild )
    {
        toCurrentRoute = toCurrentRoute.firstChild;
    }

    // Trigger the resolver if the condition met
    if ( fromCurrentRoute.paramMap.get('id') && !toCurrentRoute.paramMap.get('id') )
    {
        return true;
    }

    const fromParams = {};
    const toParams = {};

    from.paramMap.keys.forEach((key) => {
        fromParams[key] = from.paramMap.get(key);
    });

    to.paramMap.keys.forEach((key) => {
        toParams[key] = to.paramMap.get(key);
    });

    if ( isEqual(fromParams, toParams) )
    {
        return false;
    }

    // Trigger
    return true;
};

export const outboxRoutes: Route[] = [
    {
        path      : '',
        redirectTo: 'outbox/1',
        pathMatch : 'full'
    },
    {
        path     : 'new',
        component: OutNewComponent,
        resolve  : {
            data: OutNewResolvers
        }
    },
    {
        path     : '',
        component: OutComponent,
        resolve  : {
        },
        children : [
            {
                component            : OutHeaderComponent,
                matcher              : outComponentRouteMatcher,
                runGuardsAndResolvers: outComponentRunGuardsAndResolvers,
                resolve              : {
                    headerList: OutResolver
                },
                children             : [
                    {
                        path     : '',
                        component: OutDetailComponent,
                        children : [
                            {
                                path   : ':id',
                                resolve: {
                                    detailList: OutDetailResolver
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
];
