export interface InvoiceItem {
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
}

export interface Invoice {
    invoice_id: string;
    invoice_date: Date;
    due_date: Date;
    vendor_name: string;
    vendor_address: string;
    customer_name: string;
    customer_address: string;
    sub_total: number;
    tax: number;
    total: number;
    currency: string;
    items: InvoiceItem[];
}