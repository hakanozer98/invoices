export interface InvoiceItem {
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
}

export interface Invoice {
    invoiceId: string;
    invoiceDate: Date;
    dueDate: Date;
    vendorName: string;
    vendorAddress: string;
    customerName: string;
    customerAddress: string;
    subTotal: number;
    totalTax: number;
    invoiceTotal: number;
    currency: string;
    items: InvoiceItem[];
}