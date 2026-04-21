import { Injectable } from '@angular/core';
import { zip } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable()
export class AppInitService {

    constructor() {
    }

    Init() {


        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

}
