export class TableConfig{
    headerText: string;
    dataField: string;
    validators?: boolean;
    width?: number;
    display?: boolean;
    disabled?: boolean;
    type?: string;
    pipe?: string;
    placeholder?: string;
    style?: any;
    combo?: boolean;
    comboObject?: any;
    max?: any;
    scan?: boolean;

    constructor(display: boolean = true, disabled: boolean = false, type: string = 'text', placeholder: string = ''){
        this.display = display;
        this.disabled = disabled;
        this.type = type;
        this.placeholder = placeholder;
    }
}

export class TableStyle {
    textAlign: any = {
        //'right': 'text-align: right;',
        'center': 'text-align: center;',
        'left': 'text-align: left;'
    };
}

export class DataPipe{
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    currency(data: string): string{
        const rtn = data;
        return rtn;
    }
}
