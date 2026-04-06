export interface IOrder {
    id: number;
    user_id: number;
    address: string;
    total: number;
    status: string;
    subtotal: number;
    discount: number;
    shipping_fee: string;
    payment_status: string;
    shipping_status: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface IOrderItem {
    id: number;
    order_id: number;
    product_id: number;
    product_variant_id?: number;
    qty: number;
    price: number;
    discount_price: number;
    subtotal: number;
    total: number;
    created_at?: string;
    updated_at?: string;
}

// API Response interfaces
export interface OrderResponse {
    success: boolean;
    message: string;
    data: {
        order: IOrder;
        items: IOrderItem[];
    };
}

// For creating order (request)
export interface CreateOrderRequest {
    notes?: string;
}

// For order list response
export interface OrdersResponse {
    success: boolean;
    message: string;
    data: {
        orders: IOrder[];
        pagination: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
}

