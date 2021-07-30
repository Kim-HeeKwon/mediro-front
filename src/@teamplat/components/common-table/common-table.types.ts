export class TableConfig{
    headerText: string;
    dataField: string;
    width?: number;
    display?: boolean;
    disabled?: boolean;
    type?: string;
    placeholder?: string;
    style?: any;
    combo?: boolean;
    comboObject?: any;
    max?: any;

    constructor(display: boolean = true, disabled: boolean = false, type: string = 'text', placeholder: string = ''){
        this.display = display;
        this.disabled = disabled;
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
