import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class HeaderService {
    public logoChanged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
}
