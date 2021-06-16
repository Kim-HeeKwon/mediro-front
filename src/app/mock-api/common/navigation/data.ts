/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@teamplat/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id      : 'monitoring',
        title   : '모니터링',
        subtitle: '모니터링',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'monitoring.dashboards',
                title: '대쉬보드',
                type : 'basic',
                icon : 'heroicons_outline:presentation-chart-bar',
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
                icon : 'heroicons_outline:cube',
                link : '/basic-info/stock'
            },
            {
                id      : 'basic-info.account',
                title   : '거래처관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:library',
                link    : '/basic-info/account'
            },
            {
                id      : 'basic-info.supplier',
                title   : '공급사관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:office-building',
                link    : '/basic-info/supplier'
            },
            {
                id      : 'basic-info.items',
                title   : '제품관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:cube',
                link    : '/basic-info/item'
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
                icon : 'heroicons_outline:pencil-alt',
                link : '/estimate-order/estimate'
            },
            {
                id      : 'estimate-order.order',
                title   : '발주관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:pencil',
                link    : '/estimate-order/order'
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
                icon : 'heroicons_outline:folder-add',
                link : '/in-out/in'
            },
            {
                id      : 'estimate-order.order',
                title   : '주문/출고관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:folder-remove',
                link    : '/in-out/out'
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
                icon : 'heroicons_outline:cube',
                link : '/item-stock/stock'
            }
        ]
    },
    {
        id      : 'calculate',
        title   : '정산관리',
        subtitle: '의료기기 정산관리',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'calculate.pay',
                title: '정산관리',
                type : 'basic',
                icon : 'heroicons_outline:currency-dollar',
                link : '/calculate/pay'
            },
            {
                id   : 'calculate.tax',
                title: '세금계산서',
                type : 'basic',
                icon : 'heroicons_outline:calculator',
                link : '/calculate/tax'
            },
            {
                id   : 'money-manage.bill',
                title: '청구서',
                type : 'basic',
                icon : 'heroicons_outline:archive',
                link : '/calculate/bill'
            }
        ]
    },
    {
        id      : 'udi',
        title   : 'UDI',
        subtitle: 'UDI 관리',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'udi.report',
                title: 'UDI',
                type : 'basic',
                icon : 'heroicons_outline:identification',
                link : '/udi/report'
            }
        ]
    },
    {
        id      : 'my-pages',
        title   : '마이페이지',
        subtitle: '부가기능 관리',
        type    : 'group',
        icon    : 'heroicons_outline:home',
        children: [
            {
                id   : 'my-pages.setting',
                title: '마이페이지',
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
            {
                id      : 'user-interface.forms',
                title   : 'Forms',
                type    : 'collapsable',
                icon    : 'heroicons_outline:pencil-alt',
                children: [
                    {
                        id   : 'user-interface.forms.fields',
                        title: 'Fields',
                        type : 'basic',
                        link : '/ui/forms/fields'
                    },
                    {
                        id   : 'user-interface.forms.layouts',
                        title: 'Layouts',
                        type : 'basic',
                        link : '/ui/forms/layouts'
                    },
                    {
                        id   : 'user-interface.forms.wizards',
                        title: 'Wizards',
                        type : 'basic',
                        link : '/ui/forms/wizards'
                    }
                ]
            },
            {
                id   : 'user-interface.cards',
                title: 'Cards',
                type : 'basic',
                icon : 'heroicons_outline:duplicate',
                link : '/ui/cards'
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
