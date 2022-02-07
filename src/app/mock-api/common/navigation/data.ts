/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@teamplat/components/navigation';
import {environment} from "../../../../environments/environment.prod";

export const version = environment;
export const defaultNavigation: FuseNavigationItem[] = [
    /* {
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
     },*/
    {
        id      : 'monitoring',
        title   : '대시보드',
        type    : 'collapsable',
        icon    : 'space_dashboard',
        children: [
            {
                id   : 'monitoring.dashboards',
                title: '모니터링',
                type : 'basic',
                icon : 'heroicons_outline:presentation-chart-bar',
                link : '/monitoring/dashboards'
            },
            {
                id   : 'analytics.dashboards',
                title: '애널리틱스',
                type : 'basic',
                icon : 'heroicons_outline:desktop-computer',
                link : ''
            }
        ]
    },
    {
        id      : 'monitoring',
        title   : '유통관리',
        type    : 'collapsable',
        icon    : 'local_shipping',
        children: [
            {
                id   : 'estimate-order.estimate',
                title: '견적 관리',
                type : 'basic',
                icon : 'heroicons_outline:pencil-alt',
                link : '/estimate-order/estimate'
            },
            {
                id      : 'estimate-order.order',
                title   : '발주 관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:pencil',
                link    : '/estimate-order/order'
            },
            {
                id      : 'salesorder.salesorder',
                title   : '주문 관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:pencil',
                link    : '/salesorder/salesorder'
            },
            {
                id   : 'bound.inbound',
                title: '입고 관리',
                type : 'basic',
                icon : 'heroicons_outline:folder-add',
                link : '/bound/inbound'
            },
            {
                id   : 'bound.outbound',
                title: '출고 관리',
                type : 'basic',
                icon : 'heroicons_outline:folder-remove',
                link : '/bound/outbound'
            },
            {
                id   : 'stock.stock',
                title: '재고 관리',
                type : 'basic',
                icon : 'heroicons_outline:cube',
                link : '/stock/stock'
            },
        ]
    },
    {
        id: 'monitoring',
        title: '정산관리',
        type: 'collapsable',
        icon: 'heroicons_outline:archive',
        children: [
            {
                id   : 'calculate.bill',
                title: '정산 및 마감',
                type : 'basic',
                icon : 'heroicons_outline:archive',
                link : '/calculate/bill'
            },
            {
                id   : 'calculate.tax',
                title: '계산서 발행',
                type : 'basic',
                icon : 'heroicons_outline:archive',
                link : '/calculate/tax'
            },
            {
                id   : 'deposit-withdrawal.deposit',
                title: '입금관리',
                type : 'basic',
                icon : 'monetization_on',
                link : '/deposit-withdrawal/deposit'
            },
            {
                id   : 'deposit-withdrawal.withdrawal',
                title: '출금관리',
                type : 'basic',
                icon : 'monetization_on',
                link : '/deposit-withdrawal/withdrawal'
            },
            {
                id   : 'deposit-withdrawal.income-outcome',
                title: '거래처별 원장 관리',
                type : 'basic',
                icon : 'credit_score',
                link : '/deposit-withdrawal/income-outcome'
            },
        ]
    },
    {
        id      : 'udi',
        title: '공급내역 보고',
        type    : 'collapsable',
        icon    : 'insert_chart',
        children: [
            {
                id   : 'udi.manages',
                title: '식약처 공급내역보고',
                type : 'basic',
                icon : 'heroicons_outline:identification',
                link : '/udi/manages'
            },
            // {
            //     id   : 'udi.manages-email',
            //     title: '공급내역 이메일 전송',
            //     type : 'basic',
            //     icon : 'heroicons_outline:identification',
            //     link : '/udi/manages-email'
            // },
            {
                id   : 'udi.status',
                title: '통합시스템 전송내역',
                type : 'basic',
                icon : 'heroicons_outline:identification',
                link : '/udi/status'
            },
            {
                id   : 'udi.manage-sample',
                title: '공급내역 맛보기',
                type : 'basic',
                icon : 'heroicons_outline:identification',
                link : '/udi/manageSample'
            },
        ]
    },
    {
        id      : 'smart-plus',
        title   : '스마트플러스',
        type    : 'collapsable',
        icon    : 'playlist_add',
        children: [
            {
                id   : 'smart-plus.manages',
                title: '자동발주',
                type : 'basic',
                icon : 'heroicons_outline:desktop-computer',
                link : ''
            },
            {
                id   : 'smart-plus.status',
                title: '정기주문',
                type : 'basic',
                icon : 'heroicons_outline:desktop-computer',
                link : ''
            },
            {
                id      : 'stock.safety',
                title   : '안전재고',
                type    : 'basic',
                icon    : 'heroicons_outline:cube',
                link    : '/stock/safety'
            },
            {
                id   : 'stock.validity',
                title: '유효기간',
                type : 'basic',
                icon : 'heroicons_outline:calendar',
                link : '/stock/validity'
            },
            {
                id   : 'smart-plus.status',
                title: '장기재고',
                type : 'basic',
                icon : 'receipt_long',
                link : '/stock/long-term'
            },
            {
                id      : 'stock.acceptable',
                title   : '가납재고',
                type    : 'basic',
                icon    : 'heroicons_outline:cube',
                link    : '/stock/acceptable'
            },
        ]
    },
    {
        id      : 'basic-info',
        title   : '기준정보',
        type    : 'collapsable',
        icon    : 'info',
        children: [
            // {
            //     id   : 'basic-info.status',
            //     title: '초기재고등록',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '/pages/error/500'
            // },
            {
                id      : 'basic-info.account',
                title   : '거래처관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:library',
                link    : '/basic-info/account'
            },
            {
                id      : 'basic-info.items',
                title   : '품목관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:cube',
                link    : '/basic-info/items'
            },
            {
                id      : 'basic-info.item-price',
                title   : '계약단가관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:currency-dollar',
                link    : '/basic-info/item-price'
            },
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
            },
            {
                id   : 'manual.manual',
                title: '매뉴얼',
                type : 'basic',
                icon : 'heroicons_outline:play',
                link : '/manual/manual'
            },
            // {
            //     id   : 'payment.payment-history',
            //     title: '부가서비스',
            //     subtitle: '',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '/payment/payment-history'
            // },
            // {
            //     id   : 'realgrid.realgrid',
            //     title: '그리드 one',
            //     type : 'basic',
            //     //icon : 'heroicons_outline:desktop-computer',
            //     link : '/realgrid/realgrid'
            // },
            // {
            //     id   : 'realgrid.realgridHD',
            //     title: '그리드 (H-D)',
            //     type : 'basic',
            //     //icon : 'heroicons_outline:desktop-computer',
            //     link : '/realgrid/realgridHD'
            // },
        ]
    },
    // {
    //     id      : 'user-interface',
    //     title   : 'User Interface',
    //     subtitle: '개발자 참고',
    //     type    : 'group',
    //     icon    : 'heroicons_outline:collection',
    //     children: [
    //         {
    //             id      : 'user-interface.icons',
    //             title   : 'Icons',
    //             type    : 'collapsable',
    //             icon    : 'heroicons_outline:lightning-bolt',
    //             children: [
    //                 {
    //                     id   : 'user-interface.icons.heroicons-outline',
    //                     title: 'Heroicons Outline',
    //                     type : 'basic',
    //                     link : '/ui/icons/heroicons-outline'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.heroicons-solid',
    //                     title: 'Heroicons Solid',
    //                     type : 'basic',
    //                     link : '/ui/icons/heroicons-solid'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.material-twotone',
    //                     title: 'Material Twotone',
    //                     type : 'basic',
    //                     link : '/ui/icons/material-twotone'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.material-outline',
    //                     title: 'Material Outline',
    //                     type : 'basic',
    //                     link : '/ui/icons/material-outline'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.material-solid',
    //                     title: 'Material Solid',
    //                     type : 'basic',
    //                     link : '/ui/icons/material-solid'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.iconsmind',
    //                     title: 'Iconsmind',
    //                     type : 'basic',
    //                     link : '/ui/icons/iconsmind'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.feather',
    //                     title: 'Feather',
    //                     type : 'basic',
    //                     link : '/ui/icons/feather'
    //                 }
    //             ]
    //         },
    //         {
    //             id      : 'user-interface.forms',
    //             title   : 'Forms',
    //             type    : 'collapsable',
    //             icon    : 'heroicons_outline:pencil-alt',
    //             children: [
    //                 {
    //                     id   : 'user-interface.forms.fields',
    //                     title: 'Fields',
    //                     type : 'basic',
    //                     link : '/ui/forms/fields'
    //                 },
    //                 {
    //                     id   : 'user-interface.forms.layouts',
    //                     title: 'Layouts',
    //                     type : 'basic',
    //                     link : '/ui/forms/layouts'
    //                 },
    //                 {
    //                     id   : 'user-interface.forms.wizards',
    //                     title: 'Wizards',
    //                     type : 'basic',
    //                     link : '/ui/forms/wizards'
    //                 }
    //             ]
    //         },
    //         {
    //             id   : 'user-interface.cards',
    //             title: 'Cards',
    //             type : 'basic',
    //             icon : 'heroicons_outline:duplicate',
    //             link : '/ui/cards'
    //         },
    //         {
    //             id   : 'user-interface.example',
    //             title: 'Example',
    //             type : 'basic',
    //             icon : 'heroicons_outline:duplicate',
    //             link : '/example'
    //         },
    //     ]
    // },
    {
        id  : 'divider-2',
        type: 'divider'
    },
];
export const defaultNavigationM: FuseNavigationItem[] = [
     // {
     //     id      : 'user-interface',
     //     title   : 'User Interface',
     //     subtitle: '개발자 참고',
     //     type    : 'group',
     //     icon    : 'heroicons_outline:collection',
     //     children: [
     //         {
     //                      id      : 'user-interface.icons',
     //                      title   : 'Icons',
     //                      type    : 'collapsable',
     //                      icon    : 'heroicons_outline:lightning-bolt',
     //                      children: [
     //                          {
     //                              id   : 'user-interface.icons.heroicons-outline',
     //                              title: 'Heroicons Outline',
     //                              type : 'basic',
     //                              link : '/ui/icons/heroicons-outline'
     //                          },
     //                          {
     //                              id   : 'user-interface.icons.heroicons-solid',
     //                              title: 'Heroicons Solid',
     //                              type : 'basic',
     //                              link : '/ui/icons/heroicons-solid'
     //                          },
     //         {
     //                              id   : 'user-interface.icons.material-twotone',
     //                              title: 'Material Twotone',
     //                              type : 'basic',
     //                              link : '/ui/icons/material-twotone'
     //                          },
     //                          {
     //                              id   : 'user-interface.icons.material-outline',
     //                              title: 'Material Outline',
     //                              type : 'basic',
     //                              link : '/ui/icons/material-outline'
     //                          },
     //                          {
     //                              id   : 'user-interface.icons.material-solid',
     //                              title: 'Material Solid',
     //                              type : 'basic',
     //                              link : '/ui/icons/material-solid'
     //                          },
     //                          {
     //                              id   : 'user-interface.icons.iconsmind',
     //                              title: 'Iconsmind',
     //                              type : 'basic',
     //                              link : '/ui/icons/iconsmind'
     //                          },
     //                          {
     //                              id   : 'user-interface.icons.feather',
     //                              title: 'Feather',
     //                              type : 'basic',
     //                             link : '/ui/icons/feather'
     //                          }
     //                      ]
     //                  },
     //    ]
     // },
    {
        id      : 'monitoring',
        title   : '대시보드',
        type    : 'collapsable',
        icon    : 'space_dashboard',
        children: [
            {
                id   : 'monitoring.dashboards',
                title: '모니터링',
                type : 'basic',
                icon : 'heroicons_outline:presentation-chart-bar',
                link : '/monitoring/dashboards'
            },
            {
                id   : 'analytics.dashboards',
                title: '애널리틱스',
                type : 'basic',
                icon : 'heroicons_outline:desktop-computer',
                link : ''
            }
        ]
    },
    {
        id      : 'monitoring',
        title   : '유통관리',
        type    : 'collapsable',
        icon    : 'local_shipping',
        children: [
            {
                id   : 'estimate-order.estimate',
                title: '견적 관리',
                type : 'basic',
                icon : 'heroicons_outline:pencil-alt',
                link : '/estimate-order/estimate'
            },
            {
                id      : 'estimate-order.order',
                title   : '발주 관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:pencil',
                link    : '/estimate-order/order'
            },
            {
                id      : 'salesorder.salesorder',
                title   : '주문 관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:pencil',
                link    : '/salesorder/salesorder'
            },
            {
                id   : 'bound.inbound',
                title: '입고 관리',
                type : 'basic',
                icon : 'heroicons_outline:folder-add',
                link : '/bound/inbound'
            },
            {
                id   : 'bound.outbound',
                title: '출고 관리',
                type : 'basic',
                icon : 'heroicons_outline:folder-remove',
                link : '/bound/outbound'
            },
            {
                id   : 'stock.stock',
                title: '재고 관리',
                type : 'basic',
                icon : 'heroicons_outline:cube',
                link : '/stock/stock'
            },
            {
                id   : 'calculate.bill',
                title: '정산 및 마감',
                type : 'basic',
                icon : 'heroicons_outline:archive',
                link : '/calculate/bill'
            },
            {
                id   : 'calculate.tax',
                title: '계산서 발행',
                type : 'basic',
                icon : 'heroicons_outline:archive',
                link : '/calculate/tax'
            },
        ]
    },
    {
        id      : 'udi',
        subtitle: '공급내역 보고',
        type    : 'group',
        icon    : 'insert_chart',
        children: [
            {
                id   : 'udi.manages',
                title: '식약처 공급내역보고',
                type : 'basic',
                icon : 'heroicons_outline:identification',
                link : '/udi/manages'
            },
            {
                id   : 'udi.status',
                title: '통합시스템 전송내역',
                type : 'basic',
                icon : 'heroicons_outline:identification',
                link : '/udi/status'
            },
        ]
    },
    {
        id      : 'smart-plus',
        title   : '스마트플러스',
        type    : 'collapsable',
        icon    : 'playlist_add',
        children: [
            {
                id   : 'smart-plus.manages',
                title: '자동발주',
                type : 'basic',
                icon : 'heroicons_outline:desktop-computer',
                link : ''
            },
            {
                id   : 'smart-plus.status',
                title: '정기주문',
                type : 'basic',
                icon : 'heroicons_outline:desktop-computer',
                link : ''
            },
            {
                id   : 'stock.safety',
                title: '안전재고',
                type : 'basic',
                icon : 'heroicons_outline:cube',
                link : '/stock/safety'
            },
            {
                id   : 'stock.validity',
                title: '유효기간',
                type : 'basic',
                icon : 'heroicons_outline:calendar',
                link : '/stock/validity'
            },
            {
                id   : 'smart-plus.status',
                title: '장기재고',
                type : 'basic',
                icon : 'receipt_long',
                link : '/stock/long-term'
            },
            {
                id   : 'stock.acceptable',
                title: '가납재고',
                type : 'basic',
                icon : 'heroicons_outline:cube',
                link : '/stock/acceptable'
            }
        ]
    },
    {
        id      : 'basic-info',
        title   : '기준정보',
        type    : 'collapsable',
        icon    : 'info',
        children: [
            // {
            //     id   : 'basic-info.status',
            //     title: '초기재고등록',
            //     type : 'basic',
            //     icon : 'heroicons_outline:desktop-computer',
            //     link : '/pages/error/500'
            // },
            {
                id      : 'basic-info.account',
                title   : '거래처관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:library',
                link    : '/basic-info/account'
            },
            {
                id      : 'basic-info.items',
                title   : '품목관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:cube',
                link    : '/basic-info/items'
            },
            {
                id      : 'basic-info.item-price',
                title   : '계약단가관리',
                subtitle: '',
                type    : 'basic',
                icon    : 'heroicons_outline:currency-dollar',
                link    : '/basic-info/item-price'
            },
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
            },
            {
                id   : 'manual.manual',
                title: '매뉴얼',
                type : 'basic',
                icon : 'heroicons_outline:play',
                link : '/manual/manual'
            },
            // {
            //     id   : 'realgrid.realgrid',
            //     title: '그리드 one',
            //     type : 'basic',
            //     //icon : 'heroicons_outline:desktop-computer',
            //     link : '/realgrid/realgrid'
            // },
            // {
            //     id   : 'realgrid.realgridHD',
            //     title: '그리드 (H-D)',
            //     type : 'basic',
            //     //icon : 'heroicons_outline:desktop-computer',
            //     link : '/realgrid/realgridHD'
            // },
        ]
    },
    // {
    //     id      : 'user-interface',
    //     title   : 'User Interface',
    //     subtitle: '개발자 참고',
    //     type    : 'group',
    //     icon    : 'heroicons_outline:collection',
    //     children: [
    //         {
    //             id      : 'user-interface.icons',
    //             title   : 'Icons',
    //             type    : 'collapsable',
    //             icon    : 'heroicons_outline:lightning-bolt',
    //             children: [
    //                 {
    //                     id   : 'user-interface.icons.heroicons-outline',
    //                     title: 'Heroicons Outline',
    //                     type : 'basic',
    //                     link : '/ui/icons/heroicons-outline'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.heroicons-solid',
    //                     title: 'Heroicons Solid',
    //                     type : 'basic',
    //                     link : '/ui/icons/heroicons-solid'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.material-twotone',
    //                     title: 'Material Twotone',
    //                     type : 'basic',
    //                     link : '/ui/icons/material-twotone'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.material-outline',
    //                     title: 'Material Outline',
    //                     type : 'basic',
    //                     link : '/ui/icons/material-outline'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.material-solid',
    //                     title: 'Material Solid',
    //                     type : 'basic',
    //                     link : '/ui/icons/material-solid'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.iconsmind',
    //                     title: 'Iconsmind',
    //                     type : 'basic',
    //                     link : '/ui/icons/iconsmind'
    //                 },
    //                 {
    //                     id   : 'user-interface.icons.feather',
    //                     title: 'Feather',
    //                     type : 'basic',
    //                     link : '/ui/icons/feather'
    //                 }
    //             ]
    //         },
    //         {
    //             id      : 'user-interface.forms',
    //             title   : 'Forms',
    //             type    : 'collapsable',
    //             icon    : 'heroicons_outline:pencil-alt',
    //             children: [
    //                 {
    //                     id   : 'user-interface.forms.fields',
    //                     title: 'Fields',
    //                     type : 'basic',
    //                     link : '/ui/forms/fields'
    //                 },
    //                 {
    //                     id   : 'user-interface.forms.layouts',
    //                     title: 'Layouts',
    //                     type : 'basic',
    //                     link : '/ui/forms/layouts'
    //                 },
    //                 {
    //                     id   : 'user-interface.forms.wizards',
    //                     title: 'Wizards',
    //                     type : 'basic',
    //                     link : '/ui/forms/wizards'
    //                 }
    //             ]
    //         },
    //         {
    //             id   : 'user-interface.cards',
    //             title: 'Cards',
    //             type : 'basic',
    //             icon : 'heroicons_outline:duplicate',
    //             link : '/ui/cards'
    //         },
    //         {
    //             id   : 'user-interface.example',
    //             title: 'Example',
    //             type : 'basic',
    //             icon : 'heroicons_outline:duplicate',
    //             link : '/example'
    //         },
    //     ]
    // },
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
        id   : 'estimate-order.estimate',
        title: '견적',
        type : 'basic',
        icon : 'heroicons_outline:pencil-alt',
        link : '/estimate-order/estimate'
    },
    {
        id      : 'estimate-order.order',
        title   : '발주',
        subtitle: '',
        type    : 'basic',
        icon    : 'heroicons_outline:pencil',
        link    : '/estimate-order/order'
    },
    {
        id      : 'salesorder.salesorder',
        title   : '주문',
        subtitle: '',
        type    : 'basic',
        icon    : 'heroicons_outline:pencil',
        link    : '/salesorder/salesorder'
    },
    {
        id   : 'bound.inbound',
        title: '입고',
        type : 'basic',
        icon : 'heroicons_outline:folder-add',
        link : '/bound/inbound'
    },
    {
        id   : 'bound.outbound',
        title: '출고',
        type : 'basic',
        icon : 'heroicons_outline:folder-remove',
        link : '/bound/outbound'
    },
    {
        id   : 'stock.stock',
        title: '재고',
        type : 'basic',
        icon : 'heroicons_outline:cube',
        link : '/stock/stock'
    },
    {
        id   : 'stock.validity',
        title: '유효기간',
        type : 'basic',
        icon : 'heroicons_outline:calendar',
        link : '/stock/validity'
    },
    {
        id   : 'calculate.bill',
        title: '정산 및 마감',
        type : 'basic',
        icon : 'heroicons_outline:archive',
        link : '/calculate/bill'
    },
    {
        id   : 'calculate.tax',
        title: '계산서 발행',
        type : 'basic',
        icon : 'heroicons_outline:archive',
        link : '/calculate/tax'
    },
    // {
    //     id   : 'calculate.bill2',
    //     title: '반입/반출',
    //     type : 'basic',
    //     icon : 'heroicons_outline:desktop-computer',
    //     link : '/pages/error/500'
    // },
    {
        id   : 'realgrid.realgrid',
        title: '그리드',
        type : 'basic',
        //icon : 'heroicons_outline:desktop-computer',
        link : '/realgrid/realgrid'
    },
    {
        id   : 'realgrid.realgridHD',
        title: '그리드(2)',
        type : 'basic',
        //icon : 'heroicons_outline:desktop-computer',
        link : '/realgrid/realgridHD'
    },
];
