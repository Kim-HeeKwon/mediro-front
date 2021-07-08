export class TableConfig{
    headerText: string;
    dataField: string;
    width?: number;
    display?: boolean;
    type?: string;
    placeholder?: string;
    style?: any;

    constructor(display: boolean = true, type: string = 'text', placeholder: string = ''){
        this.display = display;
        this.type = type;
        this.placeholder = placeholder;
    }
}

export class TableStyle {
    textAlign: any = {
        'right': 'text-align: right;',
        'center': 'text-align: center;',
        'left': 'text-align: left;'
    };
}
