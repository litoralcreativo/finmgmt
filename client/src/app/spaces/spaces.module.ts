import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SpacesRoutingModule } from './spaces-routing.module';
import { SpacesComponent } from './spaces.component';
import { SharedModule } from '../shared/shared.module';
import { SpaceCardComponent } from './space-card/space-card.component';
import { SpaceComponent } from './space/space.component';

@NgModule({
  declarations: [SpacesComponent, SpaceCardComponent, SpaceComponent],
  imports: [CommonModule, SpacesRoutingModule, SharedModule],
})
export class SpacesModule {}
