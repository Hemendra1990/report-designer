// Add sample data for the preview
export interface AccountData {
    id: number;
    account_name: string;
    account_owner: string;
    billing_state: string;
    type: string;
    rating: string;
    last_activity: string;
    annual_revenue: number;
    [key: string]: any; // Add index signature to allow string indexing
  }