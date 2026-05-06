import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminProducts } from '../../../core/services/admin-products';

@Component({
  selector: 'app-product-form',
  standalone: false,
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
})
export class ProductForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productsService = inject(AdminProducts);

  productForm = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    category: ['', [Validators.required]],
    stock: [50, [Validators.required, Validators.min(0)]],
  });

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  productId: string | null = null;
  isEditMode = false;
  isLoading = false;
  categories = ['Supplements', 'Gym Equipment', 'Apparel', 'Accessories'];

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEditMode = true;
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: string) {
    this.isLoading = true;
    this.productsService.getProduct(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
        });
        if (product.image) {
          this.imagePreview = `http://localhost:4000${product.image}`;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/admin']);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.isLoading = true;
      const productData = this.productForm.value;

      const observer = {
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/admin']);
        },
        error: (err: any) => {
          console.error(err);
          this.isLoading = false;
          alert('Error saving product');
        }
      };

      if (this.isEditMode && this.productId) {
        this.productsService.updateProduct(this.productId, productData, this.selectedFile).subscribe(observer);
      } else {
        this.productsService.createProduct(productData, this.selectedFile).subscribe(observer);
      }
    }
  }

  onCancel() {
    this.router.navigate(['/admin']);
  }
}
