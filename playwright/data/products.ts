export interface ProductReference {
  id: number;
  name: string;
  route: string;
  category: string;
  inStock: boolean;
  hasOptions?: boolean;
}

// IDs are from the OpenCart demo catalog — if tests 404, verify products still exist in demo
export const PRODUCTS = {
  MACBOOK: {
    id: 43,
    name: 'MacBook',
    route: 'product/product&product_id=43',
    category: 'Mac',
    inStock: true,
    hasOptions: false,
  },
  IPHONE: {
    id: 40,
    name: 'iPhone',
    route: 'product/product&product_id=40',
    category: 'Phones & PDAs',
    inStock: true,
    hasOptions: false,
  },
  SONY_VAIO: {
    id: 42,
    name: 'Sony VAIO',
    route: 'product/product&product_id=42',
    category: 'Laptops & Notebooks',
    inStock: true,
    hasOptions: false,
  },
  CANON_EOS: {
    id: 30,
    name: 'Canon EOS 5D',
    route: 'product/product&product_id=30',
    category: 'Cameras',
    inStock: true,
    hasOptions: false,
  },
  HP_LP3065: {
    id: 47,
    name: 'HP LP3065',
    route: 'product/product&product_id=47',
    category: 'Monitors',
    inStock: true,
    hasOptions: false,
  },
} as const satisfies Record<string, ProductReference>;

export type ProductKey = keyof typeof PRODUCTS;

export const DEFAULT_PRODUCT = PRODUCTS.IPHONE;
