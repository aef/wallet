import { Injectable } from '@angular/core';

@Injectable()
export class UrlApi {

    constructor() { }

    getTezos() {
        return 'http://api.tzscan.io';
    }
}