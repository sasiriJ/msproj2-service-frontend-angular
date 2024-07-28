import {Component, inject, OnInit} from '@angular/core';
import {OidcSecurityService} from "angular-auth-oidc-client";
import {Router} from "@angular/router";
import {OrderService} from "../services/order.service";
import {ProductService} from "../services/product.service";
import {Order} from "../../model/order";


export type Product = {
  id?: string;
  skuCode: string;
  name: string;
  description: string;
  price: number;
}


@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [],
  template: `
    <main>
      <div class="p-4">
        <div class="flex justify-between items-center mb-4">
          <h1 class="text-2xl font-bold mb-4">Products ({{ products.length }})</h1>
          @if (isAuthenticated) {
            <button class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 ml-4"
                    (click)="goToCreateProductPage()">
              Create Product
            </button>
          }
        </div>
        @if (products.length > 0) {
          @if (orderSuccess) {
            <h4 class="text-green-500 font-bold">Order Placed Successfully</h4>
          } @else if (orderFailed) {
            <h4 class="text-red-500 font-bold">Order Failed, please try again later</h4>
            @if(quantityIsNull) {
              <h4 class="text-red-500 font-bold">Quantity cannot be null</h4>
            }
          }
          <ul class="list-disc list-inside">
            @for (product of products; track product.id) {
              <li class="mb-2 p-4 bg-gray-100 rounded-lg shadow-sm flex justify-between items-center">
                <div>
                  <span class="font-semibold">{{ product.name }}</span> -
                  <span class="text-gray-600">
                Price: {{ product.price }}
              </span>
                  <br/>
                  <span >
                Quantity: <input type="number" #quantityInput/>
              </span>
                  <br/>
                </div>
                <button class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 ml-4"
                        (click)="orderProduct(product, quantityInput.value)">
                  Order Now
                </button>
              </li>
            }
          </ul>
        } @else if (products.length === 100) {
          <span class="text-sm text-gray-700">
      Click <a class="text-blue-500 hover:underline cursor-pointer">Load More</a> to see more products
    </span>
        } @else {
          <p class="text-red-500 font-semibold">No products found!</p>
        }
      </div>
    </main>
  `,
  styleUrl: './home-page.component.css'
})
export class HomePageComponent implements OnInit {
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly productService = inject(ProductService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  isAuthenticated = false;
  products: Array<Product> = [];
  quantityIsNull = false;
  orderSuccess = false;
  orderFailed = false;

  ngOnInit(): void {
    this.oidcSecurityService.isAuthenticated$.subscribe(
      ({isAuthenticated}) => {
        this.isAuthenticated = isAuthenticated;
        this.productService.getProducts()
          .pipe()
          .subscribe(product => {
            this.products = product;
          })
      }
    )
  }

  goToCreateProductPage() {
    this.router.navigateByUrl('/add-product');
  }

  orderProduct(product: Product, quantity: string) {

    this.oidcSecurityService.userData$.subscribe(result => {
      const userDetails = {
        email: result.userData.email,
        firstName: result.userData.firstName,
        lastName: result.userData.lastName
      };

      if(!quantity) {
        this.orderFailed = true;
        this.orderSuccess = false;
        this.quantityIsNull = true;
      } else {
        const order: Order = {
          skuCode: product.skuCode,
          price: product.price,
          quantity: Number(quantity),
          userDetails: userDetails
        }

        this.orderService.orderProduct(order).subscribe(() => {
          this.orderSuccess = true;
        }, error => {
          this.orderFailed = false;
        })
      }
    })
  }
}
