import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy} from '@angular/router';
import {isNull} from "lodash-es";

const getPath = s => s.url.map(seg => seg.path).join('/');
const log = (msg, s) => console.log(`${msg}${getPath(s)}`);

export class TeamPlatReuseStrategy extends RouteReuseStrategy {
    private cache = new Map<string, DetachedRouteHandle>();

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    shouldDetach(route: ActivatedRouteSnapshot) {

        if (getPath(route).startsWith('salesorder') || (getPath(route).startsWith('calculate')) ) {
            return true;
        }

        return true;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle) {
        this.cache.set(getPath(route), detachedTree);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    shouldAttach(route: ActivatedRouteSnapshot) {
        const path = getPath(route);

        if ((path.startsWith('salesorder') && this.cache.has(path))||(path.startsWith('calculate') && this.cache.has(path))) {
            console.log('click');
            return true;
        }

        return false;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    retrieve(route: ActivatedRouteSnapshot) {
        return this.cache.get(getPath(route));
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    shouldReuseRoute(
        future: ActivatedRouteSnapshot,
        curr: ActivatedRouteSnapshot
    ) {
        // console.log(future.routeConfig);
        if(!isNull(future.routeConfig)){
            //console.log(future.routeConfig);
            if(future.routeConfig.path === 'salesorder'){
                console.log('click!!!!');
                return true;
            }

            if(future.routeConfig.path === 'calculate'){
                console.log('click!!!!');
                return true;
            }
        }
        return future.routeConfig === curr.routeConfig;
    }
}
