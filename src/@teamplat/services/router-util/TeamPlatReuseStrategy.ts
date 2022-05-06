import {ActivatedRouteSnapshot, DetachedRouteHandle, NavigationEnd, Router, RouteReuseStrategy} from '@angular/router';

interface RouteStorageObject {
    snapshot: ActivatedRouteSnapshot;
    handle: DetachedRouteHandle;
}
/**************************************************************************
 * 작성자 : 강병규 (팀플랫 PL) 2022.05.05 Version : 0.1
 * 라우터 처리
 **************************************************************************/
export class TeamPlatReuseStrategy extends RouteReuseStrategy {

    private handlers: {[key: string]: DetachedRouteHandle} = {};

    //스냅 샷을 라우터에서 분리해야하는지 여부를 묻는다. 즉 라우터는 store 메소드를 호출하여 저장 한 후에 더 이상이 스냅샷을 처리하지 않음.
    shouldDetach(route: ActivatedRouteSnapshot): boolean {
        console.log('TeamPlatReuseStrategy : shouldDetach', route);
        if (!route.routeConfig || route.routeConfig.loadChildren) {
            return false;
        }else{
            return true;
        }
    }

    //라우터가 shouldDetach 메소드를 사용하여 물어 본 후 true를 반환하면 store 메소드 호출 (즉시는 아니지만 나중에 시간이 다름).
    //라우터가 null 값을 보내면 저장소에서 이 항목을 삭제할 수 있다. 메모리는 신경 쓸 필요가 없다. (앵귤러가 알아서 해줌)
    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
        console.log('TeamPlatReuseStrategy : store', route, handle);
        this.handlers[this.calcPath(route)] = handle;
    }

    //현재 경로의 스냅 샷이 이미 저장되었는지 여부를 물음. 저장소에 올바른 스냅 샷이 포함되어 있고 라우터가 이 스냅샷을 라우팅에 다시 첨부해야하는 경우 true를 반환
    //검색 : 저장소에서 스냅 샷을 로드. shouldAttach 메소드가 true 를 반환하는 경우에만 호출.
    shouldAttach(route: ActivatedRouteSnapshot): boolean {
        console.log('TeamPlatReuseStrategy : shouldAttach', route);
        return !!this.handlers[this.calcPath(route)];
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
        //console.log('TeamPlatReuseStrategy : retrieve', route);
        return this.handlers[this.calcPath(route)];
    }

    //현재 라우팅의 스냅 샷을 향후 라우팅에 사용할 수 있는지 여부를 확인.
    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
        //console.log('TeamPlatReuseStrategy : shouldReuseRoute', future, curr);
        return future.routeConfig === curr.routeConfig;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    private calcPath(route: ActivatedRouteSnapshot) {
        return (route as any)._routerState.url;
        //return (route as any).routeConfig.path;
    }
}
