import {ActivatedRouteSnapshot, Route, UrlMatchResult, UrlSegment} from '@angular/router';
import {isEqual} from 'lodash-es';
import {InComponent} from './in.component';
import {InHeaderComponent} from './in-header/in-header.component';
import {InDetailComponent} from './in-detail/in-detail.component';
import {InDetailResolver, InResolver} from './in.resolvers';

/**
 * Mailbox custom route matcher
 *
 * @param url
 */
export const inComponentRouteMatcher: (url: UrlSegment[]) => UrlMatchResult = (url: UrlSegment[]) => {

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

export const inComponentRunGuardsAndResolvers: (from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => boolean = (from: ActivatedRouteSnapshot, to: ActivatedRouteSnapshot) => {

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

export const inboxRoutes: Route[] = [
    {
        path      : '',
        redirectTo: 'inbox/1',
        pathMatch : 'full'
    },
    {
        path     : '',
        component: InComponent,
        resolve  : {
        },
        children : [
            {
                component            : InHeaderComponent,
                matcher              : inComponentRouteMatcher,
                runGuardsAndResolvers: inComponentRunGuardsAndResolvers,
                resolve              : {
                    headerList: InResolver
                },
                children             : [
                    {
                        path     : '',
                        component: InDetailComponent,
                        children : [
                            {
                                path   : ':id',
                                resolve: {
                                    detailList: InDetailResolver
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
];
