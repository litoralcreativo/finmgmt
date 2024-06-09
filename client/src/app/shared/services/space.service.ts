import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';
import { routes } from 'src/environments/routes';
import { Category } from '../models/category.model';
import { Space, SpaceResponse } from '../models/space.model';

@Injectable({
  providedIn: 'root',
})
export class SpaceService {
  $spaces: BehaviorSubject<Space[]> = new BehaviorSubject<Space[]>([]);

  constructor(private http: HttpClient) {
    this.getSpaces();
  }

  getSpaces() {
    this.http
      .get<{ total: number; elements: SpaceResponse[] }>(routes.spaces.all, {
        withCredentials: true,
      })
      .pipe(first())
      .subscribe((res) => {
        this.$spaces.next(
          res.elements
            .map((x) => new Space(x))
            .sort((a, b) => {
              return Number(a.data.shared) - Number(b.data.shared);
            })
        );
      });
  }

  getById(spaceId: string): Observable<Space> {
    return this.http
      .get<SpaceResponse>(routes.spaces.byId(spaceId), {
        withCredentials: true,
      })
      .pipe(map((acc) => new Space(acc)));
  }
}
