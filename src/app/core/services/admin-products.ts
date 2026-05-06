import { Injectable, inject } from '@angular/core';
import { ApiService } from './api/api';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminProducts {
  private api = inject(ApiService);

  getProducts(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    return this.api.get<any>(`products?page=${page}&limit=${limit}&search=${search}`);
  }

  getProduct(id: string): Observable<any> {
    return this.api.get<any>(`products/${id}`);
  }

  createProduct(productData: any, image: File | null): Observable<any> {
    const formData = new FormData();
    Object.keys(productData).forEach(key => formData.append(key, productData[key]));
    if (image) {
      formData.append('image', image);
    }
    return this.api.post<any>('products', formData);
  }

  updateProduct(id: string, productData: any, image: File | null): Observable<any> {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (productData[key] !== null) {
        formData.append(key, productData[key]);
      }
    });
    if (image) {
      formData.append('image', image);
    }
    return this.api.patch<any>(`products/${id}`, formData);
  }

  deleteProduct(id: string): Observable<any> {
    return this.api.delete<any>(`products/${id}`);
  }
}
