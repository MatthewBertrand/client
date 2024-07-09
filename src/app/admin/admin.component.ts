import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Inventory } from '../interfaces/inventory';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  inventory: Inventory[] = [];
  productForm: FormGroup;
  private apiUrl = 'http://localhost:4899';

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      productImage: ['', Validators.required],
      productSummary: ['', Validators.required],
      productDescription: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      isLive: [false],
      availability: ['', [Validators.required, Validators.min(0)]],
      warranty: [''],
      categoryID: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {
    this.http.get<Inventory[]>(`${this.apiUrl}/inventory`).subscribe(
      inventoryData => {
        this.inventory = inventoryData;
        console.log('Inventory loaded:', this.inventory);
      },
      error => {
        console.error('Error fetching inventory:', error);
      }
    );
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const newProduct: Inventory = this.productForm.value;
      console.log('Form submission:', newProduct);

      this.http.post<Inventory>(`${this.apiUrl}/inventory`, newProduct).subscribe(
        response => {
          console.log('Product added successfully', response);
          this.loadInventory(); // Refresh the inventory list
          this.productForm.reset(); // Reset the form after submission
        },
        error => {
          console.error('Error adding product:', error);
          if (error.error) {
            console.error('Server response:', error.error);
          }
        }
      );
    }
  }

  toggleProductStatus(product: Inventory): void {
    const newStatus = !product.isLive;
    this.http.patch<void>(`${this.apiUrl}/inventory/${product.productID}`, { isLive: newStatus }).subscribe(
      () => {
        console.log(`Product ${product.productID} status updated to ${newStatus}`);
        product.isLive = newStatus;
      },
      error => {
        console.error('Error toggling product status:', error);
      }
    );
  }
}
