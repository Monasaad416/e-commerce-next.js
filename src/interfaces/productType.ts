import { IProductImage } from "./ProductImageType";

export interface IProduct {
category_id:string;
category_slug:string;
category_name:{
    [key: string]: string;
};
description:string;
discount_price:number;
id:string;
type:string;
images:IProductImage[];
is_active:boolean;
is_featured:boolean
meta_description:string;
meta_keywords:string;
name:string;
qty:number;
selling_price: number;
slug:string;
thumbnail:string;
variants:IProductVariant[]
}


// API Response interfaces
export interface ProductsResponse {
    success: boolean;
    message: string;
    data: {
        products: IProduct[];
        pagination: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
}



export interface ProductResponse {
    success: boolean;
    message: string;
    data: {
        product: IProduct;  
    };
}



export interface IProducts {
    products: IProduct[];
}

export interface AttributeValue {
  id: number
  attribute_id: number
    value: {
    [key: string]: string;
  };
  attribute_name: {
    [key: string]: string; // For localized attribute names
  };
}

export interface IProductVariant {
  id: number
  attribute_values: AttributeValue[]
  images: IProductImage[],
  discount_price: number,
  selling_price: number,
  qty: number,
  sku: string,
  featured_image: string,
}




    