import {ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy} from '@angular/router';

export class TeamPlatReuseStrategy implements RouteReuseStrategy {

    handlers: {[key: string]: DetachedRouteHandle} = {};

    //route 를 재사용할것인가. 어디서 어디로 옮길것인지 스냅샷이 넘어온다. 주소를 따져봐서, 같으면 재사용하고, 다르면 재사용하지 않는다.
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        return this.getURL(curr) === this.getURL(future)
    }

    //Detach 될때 상태를 저장할건지 아닌지 리턴해준다. detach 되는 Route를 저장해 두려면 true, 저장하지 않으려면 false
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        //나는 URL이 루트인것만  저장해 둘것이기 때문에 루트인것만 true를 준다.
        if(this.getURL(route) === '/'){
            return true;
        }else{
            return false;
        }
    }

//위에서 저장하기로 한 스냅샷을 저장해둔다.

    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        let key = this.getURL(route);
        this.handlers[key] = handle;
    }

    //저장해둔 Snapshot에 Attach 할 때의 델리게이트.
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        return !!route.routeConfig && !!this.handlers[this.getURL(route)];
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        if (!route.routeConfig) return null;
        let key = this.getURL(route);
        return this.handlers[key];
    }


    //routeSnapShot 에서 URL 을 계산해서 리턴해준다.
    getURL(route: ActivatedRouteSnapshot) {
        let next = route;
        let url = '';
        while(next) {
            if (next.url) {
                url = next.url.join('/');
            }
            next = next.firstChild;
        }
        url = '/' + url;
        return url;
    }
}
