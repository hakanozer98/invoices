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
        invoiceId: invoiceData.InvoiceId?.valueString,
        invoiceDate: invoiceData.InvoiceDate?.valueDate,
        dueDate: invoiceData.DueDate?.valueDate,
        vendorName: invoiceData.VendorName?.valueString,
        vendorAddress: invoiceData.VendorAddress?.valueAddress,
        customerName: invoiceData.CustomerName?.valueString,
        customerAddress: invoiceData.CustomerAddress?.valueAddress,
        subTotal: invoiceData.SubTotal?.valueCurrency?.amount,
        totalTax: invoiceData.TotalTax?.valueCurrency?.amount,
        invoiceTotal: invoiceData.InvoiceTotal?.valueCurrency?.amount,
        currency: invoiceData.InvoiceTotal?.valueCurrency?.currencyCode,
        items: invoiceData.Items?.valueArray?.map((item: any) => ({
            description: item.valueObject?.Description?.valueString,
            quantity: item.valueObject?.Quantity?.valueNumber,
            unit: item.valueObject?.Unit?.valueString,
            unit_price: item.valueObject?.UnitPrice?.valueCurrency?.amount
        }))
    };

    return invoice;
}
