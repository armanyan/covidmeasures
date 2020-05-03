import { TestBed } from '@angular/core/testing';

import { MapTilesService } from './map-tiles.service';

describe('MapTilesService', () => {
  let service: MapTilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapTilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
