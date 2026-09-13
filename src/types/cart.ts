export type BackendCartItem = {
  id: number
  product_id: number
  product_variant_id: number | null
  qty: number
  price: number
  discount_price: number
  subtotal: number
  tax: number
  total: number
  is_available: boolean
  availability_message: string | null
  available_qty: number | null
  name?: string
  image?: string
}

export type BackendCartPayload = {
  id: number
  user_id: number | null
  subtotal: number
  tax: number
  discount: number
  total: number
  cart_items: BackendCartItem[]
}

export type BackendCartResponse = {
  success: boolean
  message: string
  data?: {
    cart?: BackendCartPayload
    id?: number
  }
}

export type BackendApiMessage = {
  success?: boolean
  message?: string
  error?: string
}