import { Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Space } from 'src/app/shared/models/space.model';

@Component({
  selector: 'app-space-card',
  templateUrl: './space-card.component.html',
  styleUrls: ['./space-card.component.scss'],
})
export class SpaceCardComponent implements OnInit {
  @Input('space') space: Space;

  constructor(private router: Router, private aRoute: ActivatedRoute) {}

  ngOnInit(): void {}

  goToAccount() {
    this.router.navigate([this.space.data._id], { relativeTo: this.aRoute });
  }
}
