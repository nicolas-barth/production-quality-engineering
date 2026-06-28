export interface AddressData {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  postcode: string;
  country: string;
  region: string;
}

export const UK_ADDRESS: AddressData = {
  firstName: 'Test',
  lastName: 'Automation',
  address1: '123 Quality Street',
  city: 'London',
  postcode: 'SW1A 1AA',
  country: 'United Kingdom',
  region: 'Greater London',
};

export const US_ADDRESS: AddressData = {
  firstName: 'Test',
  lastName: 'Automation',
  address1: '456 Test Avenue',
  city: 'New York',
  postcode: '10001',
  country: 'United States',
  region: 'New York',
};

export const AU_ADDRESS: AddressData = {
  firstName: 'Test',
  lastName: 'Automation',
  address1: '789 Engineer Lane',
  city: 'Sydney',
  postcode: '2000',
  country: 'Australia',
  region: 'New South Wales',
};

export const INVALID_ADDRESS: AddressData = {
  firstName: '',
  lastName: '',
  address1: '',
  city: '',
  postcode: '',
  country: 'United Kingdom',
  region: 'Greater London',
};

export const INTERNATIONAL_ADDRESS: AddressData = {
  firstName: "Ó'Brien",
  lastName: 'García',
  address1: '42 Calle Mayor',
  city: 'Madrid',
  postcode: '28001',
  country: 'Spain',
  region: 'Madrid',
};
