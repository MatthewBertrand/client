import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Inventory } from '../interfaces/inventory';
import { Deals } from '../interfaces/deals';

@Component({
  selector: 'app-deals',
  standalone: true,
  imports: [CommonModule],
  providers: [HttpClient],
  templateUrl: './deals.component.html',
  styleUrls: ['./deals.component.scss']
})
export class DealsComponent implements OnInit {

  inventory: Inventory[] = [];
  deals: Deals[] = [];
  filteredInventory: Inventory[] = [];
  showOutOfStock: boolean = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.http.get<Inventory[]>("http://localhost:4899/inventory").subscribe({
      next: (inventoryData: Inventory[]) => {
        console.log('Inventory Data:', inventoryData);
        this.inventory = inventoryData;
        this.fetchDealsData();
      },
      error: (err: any) => {
        console.error('Error fetching inventory data:', err);
      }
    });
  }

  fetchDealsData(): void {
    this.http.get<Deals[]>("http://localhost:4899/deals").subscribe({
      next: (dealData: Deals[]) => {
        console.log('Deals Data:', dealData);
        this.deals = dealData;
        this.filteredInventory = this.getDealsForToday();
        console.log('Filtered Inventory:', this.filteredInventory);
      },
      error: (err: any) => {
        console.error('Error fetching deals data:', err);
      }
    });
  }

  getDealsForToday(): Inventory[] {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    console.log('Today is:', today);
    const dealsForToday = this.deals.filter(deal => deal.dayOfWeek.includes(today));
    console.log('Deals for Today:', dealsForToday);
    return this.inventory.filter(item => {
      const deal = dealsForToday.find(d => d.productID === item.productID);
      if (deal) {
        item.dayOfWeek = deal.dayOfWeek; // Include deal days in inventory item
        return true;
      }
      return false;
    });
  }

  filterProducts(inventory: Inventory[], showOutOfStock: boolean): Inventory[] {
    if (showOutOfStock) {
      return inventory;
    } else {
      return inventory.filter(item => item.availability > 0);
    }
  }

  toggleInStockOnly(event: any): void {
    this.showOutOfStock = !event.target.checked;
    this.filteredInventory = this.filterProducts(this.getDealsForToday(), this.showOutOfStock);
  }

  sortInventory(event: any): void {
    const criteria = event.target.value;
    switch (criteria) {
      case 'highLow':
        this.filteredInventory.sort((a, b) => b.price - a.price);
        break;
      case 'lowHigh':
        this.filteredInventory.sort((a, b) => a.price - b.price);
        break;
      default:
        this.filteredInventory = this.filterProducts(this.getDealsForToday(), this.showOutOfStock);
        break;
    }
  }

  trackByProductID(index: number, item: Inventory): number {
    return item.productID;
  }
}
