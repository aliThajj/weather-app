import { Component , Output , EventEmitter} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { LocationSearchComponent } from '../location-search/location-search.component';

@Component({
  selector: 'app-initial-state',
  imports: [MatIcon, LocationSearchComponent],
  templateUrl: './initial-state.component.html',
  styleUrl: './initial-state.component.css'
})
export class InitialStateComponent {
  @Output() locationSelected = new EventEmitter<any>();

  onLocationChosen(location: any) {
    this.locationSelected.emit(location);
  }
}
