

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  variant: string;
  year: number;
  manufacturingYear: number;
  registrationNumber: string;
  rtoState?: string;
  transmission: 'Manual' | 'Automatic';
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'CNG';
  mileage: number;
  odometerReading: number;
  vin?: string;
  ownershipType: string;
  
  // Financials
  cost: number; // Purchase price for the dealer
  refurbishmentCost: number;
  price: number; // Selling price to customer
  
  // Buying Details
  sellerName?: string;
  sellerPhone?: string;
  aadharFront?: string;
  aadharBack?: string;
  panFront?: string;
  buyingDate?: string;
  buyingPrice?: number;
  loanStatus?: 'Hypo Terminated on RC' | 'Open Loan' | 'Closed Loan';
  bankLfcLetter?: string;
  bankNocLetter?: string;
  nocStatus?: 'Available' | 'Not Available';
  foreclosureAmount?: number;
  foreclosurePaymentProof?: string;
  amountPaidToSeller?: number;
  sellerPaymentMethod?: 'upi' | 'bank' | 'cheque' | 'cash';
  sellerPaymentProof?: string;

  // Image Gallery
  images?: {
    exterior?: {
      front?: string;
      front_right?: string;
      right?: string;
      right_back?: string;
      back?: string;
      open_dickey?: string;
      spare_tyre?: string;
      left_back?: string;
      left?: string;
      left_front?: string;
      open_bonnet?: string;
      upper_roof?: string;
      lhs_a_pillar?: string;
      lhs_b_pillar?: string;
      lhs_c_pillar?: string;
      rhs_a_pillar?: string;
      rhs_b_pillar?: string;
      rhs_c_pillar?: string;
    },
    tyres?: {
      lhs_front_tyre?: string;
      lhs_back_tyre?: string;
      rhs_front_tyre?: string;
      rhs_back_tyre?: string;
    },
    interior?: {
      odometer?: string;
      frontRightDoorOpen?: string;
      backRightDoorOpen?: string;
      dashboardFromBack?: string;
    }
  };
  
  spareTyreAvailability?: 'Available' | 'Not Available';

  // Documentation
  rcImage?: string;
  insuranceType?: 'Third Party' | 'Comprehensive' | 'Zero Depth' | 'Expired';
  insuranceImage?: string;
  insuranceValidUpto?: string;
  ncbPercentage?: number;

  status: 'For Sale' | 'Sold' | 'In Refurbishment' | 'Draft';
  dateAdded: string;
  dealerId: string;
  
  // Sold Details
  sellingPrice?: number;
  sellingDate?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerAadharFront?: string;
  buyerAadharBack?: string;
  buyerPanFront?: string;
  buyerPaymentMethod?: 'upi' | 'bank' | 'cheque' | 'cash';
  buyerPaymentProof?: string;

}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  aadharImageUrl: string | null;
  role: 'Sales' | 'Manager' | 'Mechanic' | 'HR' | 'Office Boy' | 'Cleaner' | 'Security Guard' | 'Other';
  salary: number;
  avatarUrl: string;
  dealerId: string;
  dealershipName?: string;
  password?: string | null;
  joiningDate: string;
  leadsThisMonth?: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vehicleId?: string;
  assignedTo?: string;
  testDriveStatus: 'Scheduled' | 'Completed' | 'No Show' | 'Not Scheduled';
  conversionStatus: 'Converted' | 'In Progress' | 'Lost';
  dealerId: string;
  dateAdded: string;
  otherVehicleName?: string;
  otherVehicleReg?: string;

  // Joined properties
  vehicleMake?: string;
  vehicleModel?: string;
  employeeName?: string;
}

export interface Dealer {
    id: string;
    name: string;
    email: string;
    dealershipName: string;
    state: string;
    city: string;
    vehicleCategory: 'Two Wheeler' | 'Four Wheeler' | 'Hybrid';
    status: 'approved' | 'pending' | 'deactivated';
    phone: string;
    password?: string; // Should be handled securely on a server
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  dealerId: string;
  month: number;
  year: number;
  baseSalary: number;
  incentives: number;
  status: 'Pending' | 'Paid';
  generatedDate: string;
  paidDate?: string;
}

export interface WebsiteContent {
    dealerId: string;
    brandName?: string | null;
    logoUrl?: string | null;
    tagline?: string | null;
    aboutUs?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    address?: string | null;
    activeTheme?: string | null;
}
    
