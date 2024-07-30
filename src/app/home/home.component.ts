import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Inventory } from '../interfaces/inventory';
import { Deals } from '../interfaces/deals';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  providers: [HttpClient],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  inventory: Inventory[] = [];
  filteredInventory: any[] = []; // Using any[] to accommodate merged deal data
  originalInventory: Inventory[] = [];
  deals: { [key: number]: string } = {};
  showOutOfStock: boolean = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchInventory();
  }

  fetchInventory(): void {
    this.http.get<Inventory[]>(environment.server + '/inventory').subscribe(inventoryFromNode => {
      console.log('Fetched inventory:', inventoryFromNode);
      this.inventory = inventoryFromNode;
      this.originalInventory = [...inventoryFromNode];
      this.filteredInventory = this.filterProducts(this.inventory, this.showOutOfStock);
      this.fetchDeals();
    });
  }

  fetchDeals(): void {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    console.log(`Fetching deals for today (${today})`);
    this.http.get<any[]>(environment.server + '/deals?dayOfWeek=' + today).subscribe(dealsData => {
      console.log('Fetched deals:', dealsData);
      dealsData.forEach(deal => {
        this.deals[deal.productID] = deal.dealAmount;
      });
      console.log('Deals loaded:', this.deals);
      this.mergeInventoryWithDeals();
    });
  }

  mergeInventoryWithDeals(): void {
    console.log('Merging inventory with deals');
    this.filteredInventory = this.filteredInventory.map(item => {
      const deal = this.deals[item.productID];
      console.log(`Product ID: ${item.productID}, Deal: ${deal ? deal : 'No deal'}`);
      return { ...item, dealAmount: deal ? deal : null };
    });
    console.log('Merged inventory with deals:', this.filteredInventory);
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
    console.log(`Show out of stock: ${this.showOutOfStock}`);
    this.filteredInventory = this.filterProducts(this.inventory, this.showOutOfStock);
    this.mergeInventoryWithDeals();
  }

  sortInventory(event: any): void {
    const criteria = event.target.value;
    switch (criteria) {
      case 'highLow':
        console.log(`High to low`);
        this.filteredInventory.sort((a, b) => b.price - a.price);
        break;
      case 'lowHigh':
        console.log(`low to high`);
        this.filteredInventory.sort((a, b) => a.price - b.price);
        break;
      default:
        this.filteredInventory = this.filterProducts([...this.originalInventory], this.showOutOfStock);
        this.mergeInventoryWithDeals();
        break;
    }
  }

  trackByProductID(index: number, item: Inventory): number {
    return item.productID;
  }
  register(event: Event): void {
    event.preventDefault();
    alert("You have registered!");
  }
  

  
}
