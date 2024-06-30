import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarRoutingModule } from './calendar-routing.module';
import { CalendarComponent } from './calendar.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [CalendarComponent],
  imports: [CommonModule, SharedModule, CalendarRoutingModule],
})
export class CalendarModule {}
