import { TestBed } from '@angular/core/testing';

import { AdminProducts } from './admin-products';

describe('AdminProducts', () => {
  let service: AdminProducts;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminProducts);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
