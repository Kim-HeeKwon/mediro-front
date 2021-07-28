import {Directive, ElementRef, Input, OnInit, Renderer2} from '@angular/core';

@Directive({
    selector: '[resizeColumn]'
})
export class FuseColumnResizeDirective implements OnInit {
    @Input('resizeColumn') resizable: boolean;
    @Input() index: number;
    private startX: number;
    private startWidth: number;
    private column: HTMLElement;
    private table: HTMLElement;
    private pressed: boolean;
    constructor(private renderer: Renderer2, private el: ElementRef) {
        this.column = this.el.nativeElement;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    ngOnInit() {
        if (this.resizable) {
            const row = this.renderer.parentNode(this.column);
            const thead = this.renderer.parentNode(row);
            this.table = this.renderer.parentNode(thead);

            const resizer = this.renderer.createElement('span');
            this.renderer.addClass(resizer, 'resize-holder');
            this.renderer.appendChild(this.column, resizer);
            this.renderer.listen(resizer, 'mousedown', this.onMouseDown);
            this.renderer.listen(this.table, 'mousemove', this.onMouseMove);
            this.renderer.listen('document', 'mouseup', this.onMouseUp);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onMouseDown = (event: MouseEvent) => {
        this.pressed = true;
        this.startX = event.pageX;
        this.startWidth = this.column.offsetWidth;
    };

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onMouseMove = (event: MouseEvent) => {
        const offset = 35;
        if (this.pressed && event.buttons) {
            this.renderer.addClass(this.table, 'resizing');

            // Calculate width of column
            const width =
                this.startWidth + (event.pageX - this.startX - offset);

            const tableCells = Array.from(this.table.querySelectorAll('.mat-row')).map(
                (row: any) => row.querySelectorAll('.mat-cell').item(this.index)
            );

            // Set table header width
            this.renderer.setStyle(this.column, 'width', `${width}px`);

            // Set table cells width
            for (const cell of tableCells) {
                this.renderer.setStyle(cell, 'width', `${width}px`);
            }
        }
    };

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    onMouseUp = (event: MouseEvent) => {
        if (this.pressed) {
            this.pressed = false;
            this.renderer.removeClass(this.table, 'resizing');
        }
    };
}
