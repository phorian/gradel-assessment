export interface IProduct {
    _id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    quantity: number;
  }
  
  export interface IProductInput {
    name: string;
    description: string;
    price: number;
    category: string;
    quantity?: number;
  } 