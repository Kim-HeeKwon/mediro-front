/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@teamplat/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id      : 'dashboards',
        title   : '모니터링',
        subtitle: '모니터링',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'dashboards.project',
                title: '대쉬보드',
                type : 'basic',
                icon : 'heroicons_outline:clipboard-check',
                link : '/example'
            }
        ]
    },
    {
        id      : 'basic-info',
        title   : '기준정보',
        subtitle: '의료기기 기준정보 관리',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'basic-info.stock',
                title: '재고등록',
                type : 'basic',
                icon : 'heroicons_outline:academic-cap',
                link : '/apps/stock'
            },
            {
                id      : 'basic-info.company',
                title   : '거래처관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:calendar',
                link    : '/apps/company'
            },
            {
                id      : 'basic-info.supplier',
                title   : '공급사관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:calendar',
                link    : '/apps/supplier'
            },
            {
                id      : 'basic-info.item',
                title   : '제품관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:calendar',
                link    : '/apps/item'
            }
        ]
    },
    {
        id      : 'estimate-order',
        title   : '견적/발주',
        subtitle: '의료기기 견적 및 발주 관리',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'estimate-order.estimate',
                title: '견적관리',
                type : 'basic',
                icon : 'heroicons_outline:academic-cap',
                link : '/apps/estimate'
            },
            {
                id      : 'estimate-order.order',
                title   : '발주관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:calendar',
                link    : '/apps/order'
            },
        ]
    },
    {
        id      : 'in-out',
        title   : '입/출고',
        subtitle: '의료기기 입고 및 출고 관리',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'estimate-order.estimate',
                title: '입고관리',
                type : 'basic',
                icon : 'heroicons_outline:academic-cap',
                link : '/apps/in'
            },
            {
                id      : 'estimate-order.order',
                title   : '주문/출고관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:calendar',
                link    : '/apps/out'
            },
        ]
    },
    {
        id      : 'item-stock',
        title   : '재고관리',
        subtitle: '의료기기 재고관리',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'item-stock.stock',
                title: '재고관리',
                type : 'basic',
                icon : 'heroicons_outline:academic-cap',
                link : '/apps/in'
            }
        ]
    },
    {
        id      : 'pages',
        title   : 'Pages',
        subtitle: '부가기능',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'apps.setting',
                title: '세팅',
                type : 'basic',
                icon : 'heroicons_outline:cog',
                link : '/pages/settings'
            }
        ]
    },
    {
        id      : 'user-interface',
        title   : 'User Interface',
        subtitle: '개발자 참고',
        type    : 'group',
        icon    : 'heroicons_outline:collection',
        children: [
            {
                id      : 'user-interface.icons',
                title   : 'Icons',
                type    : 'collapsable',
                icon    : 'heroicons_outline:lightning-bolt',
                children: [
                    {
                        id   : 'user-interface.icons.heroicons-outline',
                        title: 'Heroicons Outline',
                        type : 'basic',
                        link : '/ui/icons/heroicons-outline'
                    },
                    {
                        id   : 'user-interface.icons.heroicons-solid',
                        title: 'Heroicons Solid',
                        type : 'basic',
                        link : '/ui/icons/heroicons-solid'
                    },
                    {
                        id   : 'user-interface.icons.material-twotone',
                        title: 'Material Twotone',
                        type : 'basic',
                        link : '/ui/icons/material-twotone'
                    },
                    {
                        id   : 'user-interface.icons.material-outline',
                        title: 'Material Outline',
                        type : 'basic',
                        link : '/ui/icons/material-outline'
                    },
                    {
                        id   : 'user-interface.icons.material-solid',
                        title: 'Material Solid',
                        type : 'basic',
                        link : '/ui/icons/material-solid'
                    },
                    {
                        id   : 'user-interface.icons.iconsmind',
                        title: 'Iconsmind',
                        type : 'basic',
                        link : '/ui/icons/iconsmind'
                    },
                    {
                        id   : 'user-interface.icons.feather',
                        title: 'Feather',
                        type : 'basic',
                        link : '/ui/icons/feather'
                    }
                ]
            },
        ]
    },
    {
        id  : 'divider-2',
        type: 'divider'
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
