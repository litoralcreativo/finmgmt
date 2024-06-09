import { Component, OnInit } from '@angular/core';
import { Space } from '../shared/models/space.model';
import { SpaceService } from '../shared/services/space.service';

@Component({
  selector: 'app-spaces',
  templateUrl: './spaces.component.html',
  styleUrls: ['./spaces.component.scss'],
})
export class SpacesComponent implements OnInit {
  spaces: Space[] = [];
  constructor(private spacesService: SpaceService) {}

  ngOnInit(): void {
    this.spacesService.$spaces.subscribe((spa) => {
      this.spaces = spa;
    });
  }

  goToSpace() {}
}
