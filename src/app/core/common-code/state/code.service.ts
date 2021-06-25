import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CodeStore } from './code.store';

@Injectable({ providedIn: 'root' })
export class CodeService {

    constructor(private codeStore: CodeStore,
                private http: HttpClient) {
    }
}
