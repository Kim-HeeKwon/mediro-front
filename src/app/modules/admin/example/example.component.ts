import { AfterViewInit, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Common } from '@teamplat/providers/common/common';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';

@Component({
    selector     : 'example',
    templateUrl  : './example.component.html',
    styleUrls: ['./example.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ExampleComponent implements OnInit, AfterViewInit, OnDestroy
{
    /**
     * 변수 Setting
     */
    isLoading: boolean = false;
    selected = [];
    searchInputControl: FormControl = new FormControl();
    // eslint-disable-next-line @typescript-eslint/naming-convention
    ColumnMode = ColumnMode;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    SelectionType = SelectionType;

    items: any= [{'name':'test1','sku':'1','price':'1000'},
        {'name':'test2','sku':'2','price':'2000'},
        {'name':'test3','sku':'3','price':'3000'},
        {'name':'test4','sku':'4','price':'1000'},
        {'name':'test5','sku':'5','price':'2000'},
        {'name':'test6','sku':'6','price':'3000'},
        {'name':'test7','sku':'7','price':'1000'},
        {'name':'test8','sku':'8','price':'2000'},
        {'name':'test9','sku':'9','price':'3000'},
        {'name':'test8','sku':'8','price':'2000'},
        {'name':'test9','sku':'9','price':'3000'},
        {'name':'test7','sku':'7','price':'1000'},
        {'name':'test8','sku':'8','price':'2000'},
        {'name':'test9','sku':'9','price':'3000'},
        {'name':'test8','sku':'8','price':'2000'},
        {'name':'test9','sku':'9','price':'3000'},
        {'name':'test2','sku':'2','price':'2000'},
        {'name':'test3','sku':'3','price':'3000'},
        {'name':'test4','sku':'4','price':'1000'},
        {'name':'test5','sku':'5','price':'2000'},
        {'name':'test6','sku':'6','price':'3000'},
        {'name':'test7','sku':'7','price':'1000'},
        {'name':'test8','sku':'8','price':'2000'},
        {'name':'test9','sku':'9','price':'3000'},
        {'name':'test8','sku':'8','price':'2000'},
        {'name':'test9','sku':'9','price':'3000'},
        {'name':'test7','sku':'7','price':'1000'},
        {'name':'test8','sku':'8','price':'2000'},
        {'name':'test9','sku':'9','price':'3000'},
        {'name':'test8','sku':'8','price':'2000'},
        {'name':'test9','sku':'9','price':'3000'},
        {'name':'test2','sku':'2','price':'2000'},
        {'name':'test3','sku':'3','price':'3000'},
        {'name':'test4','sku':'4','price':'1000'},
        {'name':'test5','sku':'5','price':'2000'},
        {'name':'test6','sku':'6','price':'3000'},
        {'name':'test7','sku':'7','price':'1000'},
        {'name':'test8','sku':'8','price':'2000'},
        {'name':'test9','sku':'9','price':'3000'},
        {'name':'test8','sku':'8','price':'2000'},
        {'name':'test9','sku':'9','price':'3000'},
        {'name':'test7','sku':'7','price':'1000'},
        {'name':'test8','sku':'8','price':'2000'},
        {'name':'test9','sku':'9','price':'3000'},
        {'name':'test8','sku':'8','price':'2000'},
        {'name':'test9','sku':'9','price':'3000'}];

    /**
     * Constructor
     */
    constructor(
        private common: Common,
    )
    {
        console.log('hello');
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
    }

    /**
     * 메디로 Function
     * **/

    onSelect({ selected }): void {
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
    }

    onActivate(event): boolean{
        if(event.type === 'checkbox'){
            event.cellElement.blur();
            return false;
        }
        if(event.type === 'click'){
            event.cellElement.blur();
        }
    }

    displayCheck(row): any{
        return row.name !== 'Ethel Price';
    }

    tblClick(param): void {
        console.log('tblClick');
    }
}
