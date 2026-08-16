export type UserRole = 'buyer' | 'seller' | 'admin';

export type FulfillmentStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole | null;
  avatarUrl?: string;
  storeName?: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  description: string;
  avatar?: string;
  banner?: string;
  rating?: number;
  totalSales?: number;
  verified: boolean;
  joinedDate: string;
  location?: string;
}

export interface DbProduct {
  id: string;
  seller_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  price: number;
  original_price: number | null;
  stock: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  seller_profiles?: {
    id: string;
    store_name: string;
    store_slug: string;
  } | null;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  store: {
    id: string;
    name: string;
    slug: string;
    rating?: number;
    verified: boolean;
  };
  rating?: number;
  reviewCount?: number;
  stock: number;
  features?: string[];
  badge?: 'Featured' | 'Best Seller' | 'New' | 'Popular';
  isPickedForYou?: boolean;
  isActive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  itemCount: number;
  image: string;
  iconName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: {
    productId: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    storeName: string;
  }[];
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: 'cash_on_delivery' | 'demo_card';
}

export interface DbOrder {
  id: string;
  buyer_id: string;
  total_amount: number;
  status: FulfillmentStatus;
  payment_method: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  created_at: string;
  order_items?: DbOrderItem[];
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  seller_id: string;
  quantity: number;
  unit_price: number;
  fulfillment_status: FulfillmentStatus;
  created_at: string;
  products?: {
    name: string;
    image_url: string | null;
    slug: string;
  } | null;
  orders?: {
    id: string;
    created_at: string;
    shipping_name: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_zip: string;
    profiles?: {
      full_name: string;
    } | null;
  } | null;
}

export interface FilterState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price-low' | 'price-high' | 'newest';
}
