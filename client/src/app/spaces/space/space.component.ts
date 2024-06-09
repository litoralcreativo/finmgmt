import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category } from 'src/app/shared/models/category.model';
import { Space } from 'src/app/shared/models/space.model';
import { SpaceService } from 'src/app/shared/services/space.service';

@Component({
  selector: 'app-space',
  templateUrl: './space.component.html',
  styleUrls: ['./space.component.scss'],
})
export class SpaceComponent implements OnInit {
  spaceId: string;
  space: Space;
  spaceCategories: Category[];
  fixed: Category[] = [];
  variable: Category[] = [];

  constructor(
    private aRoute: ActivatedRoute,
    private spaceService: SpaceService
  ) {}

  ngOnInit(): void {
    this.aRoute.paramMap.subscribe((params) => {
      const id = params.get('spaceId');
      if (!id) throw new Error('No accountId provided');

      this.spaceId = id;
      this.spaceService.getById(this.spaceId).subscribe((space) => {
        this.space = space;
        this.spaceCategories = space.getCategories();
        this.fixed = this.spaceCategories.filter((x) => x.fixed);
        this.variable = this.spaceCategories.filter((x) => !x.fixed);
      });
    });
  }
}
