export default async function analyzeDocument(base64: string) {
    const endpoint = process.env.EXPO_PUBLIC_DI_ENDPOINT as string;
    const apiKey = process.env.EXPO_PUBLIC_DI_KEY as string;
    const analyzeUrl = `${endpoint}/documentintelligence/documentModels/prebuilt-invoice:analyze?api-version=2024-07-31-preview`
    
    const headers = {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey
    };
    const body = JSON.stringify({
        "base64Source": base64
    })

    // Send POST request
    const postResponse = await fetch(analyzeUrl, {
        method: 'POST',
        headers: headers,
        body: body
    });

    if (postResponse.status !== 202) {
        throw new Error(`Failed to analyze document: ${postResponse.statusText}`);
    }

    const operationLocation = postResponse.headers.get('Operation-Location');
    if (!operationLocation) {
        throw new Error('Operation-Location header is missing in the response');
    }

    // Polling for the result
    let analyzeResult;
    while (true) {
        const getResponse = await fetch(operationLocation, {
            method: 'GET',
            headers: {
                "Ocp-Apim-Subscription-Key": apiKey
            }
        });

        analyzeResult = await getResponse.json();
        if (analyzeResult.status === 'succeeded') {
            break;
        } else if (analyzeResult.status === 'failed') {
            throw new Error('Document analysis failed');
        }

        // Wait for 1 second before polling again
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const invoiceData = analyzeResult.analyzeResult.documents[0].fields;

    const invoice = {
        customerName: invoiceData.CustomerName?.valueString,
        customerId: invoiceData.CustomerId?.valueString,
        purchaseOrder: invoiceData.PurchaseOrder?.valueString,
        invoiceId: invoiceData.InvoiceId?.valueString,
        invoiceDate: invoiceData.InvoiceDate?.valueDate,
        dueDate: invoiceData.DueDate?.valueDate,
        vendorName: invoiceData.VendorName?.valueString,
        vendorAddress: invoiceData.VendorAddress?.valueString,
        vendorAddressRecipient: invoiceData.VendorAddressRecipient?.valueString,
        customerAddress: invoiceData.CustomerAddress?.valueString,
        customerAddressRecipient: invoiceData.CustomerAddressRecipient?.valueString,
        billingAddress: invoiceData.BillingAddress?.valueString,
        billingAddressRecipient: invoiceData.BillingAddressRecipient?.valueString,
        shippingAddress: invoiceData.ShippingAddress?.valueString,
        shippingAddressRecipient: invoiceData.ShippingAddressRecipient?.valueString,
        subTotal: invoiceData.SubTotal?.valueCurrency?.amount,
        totalDiscount: invoiceData.TotalDiscount?.valueCurrency?.amount,
        totalTax: invoiceData.TotalTax?.valueCurrency?.amount,
        invoiceTotal: invoiceData.InvoiceTotal?.valueCurrency?.amount,
        amountDue: invoiceData.AmountDue?.valueCurrency?.amount,
        previousUnpaidBalance: invoiceData.PreviousUnpaidBalance?.valueCurrency?.amount,
        remittanceAddress: invoiceData.RemittanceAddress?.valueString,
        remittanceAddressRecipient: invoiceData.RemittanceAddressRecipient?.valueString,
        serviceAddress: invoiceData.ServiceAddress?.valueString,
        serviceAddressRecipient: invoiceData.ServiceAddressRecipient?.valueString,
        serviceStartDate: invoiceData.ServiceStartDate?.valueDate,
        serviceEndDate: invoiceData.ServiceEndDate?.valueDate,
        vendorTaxId: invoiceData.VendorTaxId?.valueString,
        customerTaxId: invoiceData.CustomerTaxId?.valueString,
        paymentTerm: invoiceData.PaymentTerm?.valueString,
        kvkNumber: invoiceData.KVKNumber?.valueString,
        currency: invoiceData.InvoiceTotal?.valueCurrency?.currencyCode,
        paymentDetails: invoiceData.PaymentDetails?.valueArray?.map((detail: any) => ({
            iban: detail.valueObject?.IBAN?.valueString,
            swift: detail.valueObject?.SWIFT?.valueString,
            bankAccountNumber: detail.valueObject?.BankAccountNumber?.valueString,
            bPayBillerCode: detail.valueObject?.BPayBillerCode?.valueString,
            bPayReference: detail.valueObject?.BPayReference?.valueString
        })),
        items: invoiceData.Items?.valueArray?.map((item: any) => ({
            amount: item.valueObject?.TotalAmount?.valueCurrency?.amount,
            date: item.valueObject?.Date?.valueDate,
            description: item.valueObject?.Description?.valueString,
            quantity: item.valueObject?.Quantity?.valueNumber,
            productCode: item.valueObject?.ProductCode?.valueString,
            tax: item.valueObject?.Tax?.valueCurrency?.amount,
            taxRate: item.valueObject?.TaxRate?.valueString,
            unit: item.valueObject?.Unit?.valueString,
            unitPrice: item.valueObject?.UnitPrice?.valueCurrency?.amount
        }))
    };

    return invoice;
}
