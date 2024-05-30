import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent implements OnInit {
  constructor(private router: Router, private aRoute: ActivatedRoute) {}

  ngOnInit(): void {}

  onNavLinkClick(to: string[]) {
    this.router.navigate(to, { relativeTo: this.aRoute });
  }
}
