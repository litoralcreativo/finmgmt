import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpaceComponent } from './space/space.component';
import { SpacesComponent } from './spaces.component';

const routes: Routes = [
  {
    path: '',
    component: SpacesComponent,
  },
  {
    path: ':spaceId',
    component: SpaceComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SpacesRoutingModule {}
