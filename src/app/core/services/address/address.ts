import { Injectable } from '@angular/core';
import { ApiService } from '../api/api';
import { Observable } from 'rxjs';

export interface Address {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private endpoint = 'addresses';

  constructor(private api: ApiService) {}

  getAddresses(): Observable<Address[]> {
    return this.api.get<Address[]>(this.endpoint);
  }

  getAddress(id: string): Observable<Address> {
    return this.api.get<Address>(`${this.endpoint}/${id}`);
  }

  createAddress(address: Partial<Address>): Observable<Address> {
    return this.api.post<Address>(this.endpoint, address);
  }

  updateAddress(id: string, address: Partial<Address>): Observable<Address> {
    return this.api.put<Address>(`${this.endpoint}/${id}`, address);
  }

  deleteAddress(id: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }

  setDefault(id: string): Observable<Address> {
    return this.api.post<Address>(`${this.endpoint}/${id}/set-default`, {});
  }
}
