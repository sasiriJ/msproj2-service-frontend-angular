import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Order} from "../../model/order";

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private httpClient: HttpClient) {
  }

  //TODO: Add error handling
  orderProduct(order: Order):Observable<Order[]>{
    return this.httpClient.get<Order[]>('http://localhost:9000/api/order')
  }
}
