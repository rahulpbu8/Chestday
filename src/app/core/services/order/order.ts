import { Injectable } from '@angular/core';
import { ApiService } from '../api/api';
import { Observable } from 'rxjs';

export interface Order {
  id: string;
  userId: string;
  addressId: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  items: any[];
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private api: ApiService) {}

  getOrders(): Observable<Order[]> {
    return this.api.get<Order[]>('orders');
  }

  getOrder(id: string): Observable<Order> {
    return this.api.get<Order>(`orders/${id}`);
  }

  createOrder(orderData: any): Observable<Order> {
    return this.api.post<Order>('orders', orderData);
  }

  getAllOrdersAdmin(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    return this.api.get<any>(`orders/admin/all?page=${page}&limit=${limit}&search=${search}`);
  }

  getOrderDetailAdmin(id: string): Observable<Order> {
    return this.api.get<Order>(`orders/admin/${id}`);
  }
}
