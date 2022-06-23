interface Address {
  name: string;
  streetNumber: number;
  route: string; // Named route such as NE Sesame St
  locality: string; // City or town
  region: string; // State or province
  postalCode: string;
}

export default Address;