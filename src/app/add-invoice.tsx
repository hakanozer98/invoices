import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Invoice, InvoiceItem } from '../types/Invoice';
import { MaterialIcons } from '@expo/vector-icons';  // Add this import

// Add these functions after the imports and before the component
const validateInvoice = (invoice: Invoice) => {
    const errors: Record<string, string> = {};
    
    if (!invoice.invoiceId.trim()) errors.invoiceId = 'Invoice ID is required';
    if (!invoice.vendorName.trim()) errors.vendorName = 'Vendor name is required';
    if (!invoice.customerName.trim()) errors.customerName = 'Customer name is required';
    if (invoice.items.length === 0) errors.items = 'At least one item is required';
    if (invoice.invoiceTotal <= 0) errors.total = 'Invoice total must be greater than 0';
    
    return errors;
};

export default function AddInvoice() {
    const { invoiceData } = useLocalSearchParams();
    const parsedInvoiceData = invoiceData ? JSON.parse(invoiceData as string) : null;

    const [invoice, setInvoice] = useState<Invoice>({
        invoiceId: parsedInvoiceData?.invoiceId || '',
        invoiceDate: parsedInvoiceData?.invoiceDate ? new Date(parsedInvoiceData.invoiceDate) : new Date(),
        dueDate: parsedInvoiceData?.dueDate ? new Date(parsedInvoiceData.dueDate) : new Date(),
        vendorName: parsedInvoiceData?.vendorName || 'Vendor Name',
        vendorAddress: parsedInvoiceData?.vendorAddress || '',
        customerName: parsedInvoiceData?.customerName || 'Customer Name',
        customerAddress: parsedInvoiceData?.customerAddress || '',
        subTotal: parsedInvoiceData?.subTotal || 0,
        totalTax: parsedInvoiceData?.totalTax || 0,
        invoiceTotal: parsedInvoiceData?.invoiceTotal || 0,
        currency: parsedInvoiceData?.currency || 'USD',
        items: parsedInvoiceData?.items || []
    });

    const [items, setItems] = useState<InvoiceItem[]>(parsedInvoiceData?.items || []);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentItem, setCurrentItem] = useState<{
        description: string;
        quantity: string;
        unit: string;
        unitPrice: string;
    }>({
        description: '',
        quantity: '',
        unit: '',
        unitPrice: ''
    });

    const [showInvoiceDatePicker, setShowInvoiceDatePicker] = useState(false);
    const [showDueDatePicker, setShowDueDatePicker] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (name: string, value: string) => {
        setInvoice(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddItem = () => {
        setIsModalVisible(true);
    };

    const handleSaveItem = () => {
        const newItems = [...items, {
            description: currentItem.description,
            quantity: Number(currentItem.quantity) || 0,
            unit: currentItem.unit,
            unitPrice: Number(currentItem.unitPrice) || 0
        }];
        setItems(newItems);
        
        // Recalculate totals
        const subTotal = newItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const totalTax = subTotal * 0.1;
        setInvoice(prev => ({
            ...prev,
            items: newItems,
            subTotal,
            totalTax,
            invoiceTotal: subTotal + totalTax
        }));

        setCurrentItem({
            description: '',
            quantity: '',
            unit: '',
            unitPrice: ''
        });
        setIsModalVisible(false);
    };

    const handleDeleteItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
        
        // Recalculate totals
        const subTotal = newItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const totalTax = subTotal * 0.1;
        setInvoice(prev => ({
            ...prev,
            items: newItems,
            subTotal,
            totalTax,
            invoiceTotal: subTotal + totalTax
        }));
    };

    const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            [field]: value
        };
        setItems(newItems);
        
        // Recalculate totals
        const subTotal = newItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const totalTax = subTotal * 0.1; // Assuming 10% tax
        setInvoice(prev => ({
            ...prev,
            items: newItems,
            subTotal,
            totalTax,
            invoiceTotal: subTotal + totalTax
        }));
    };

    const onInvoiceDateChange = (event: any, selectedDate?: Date) => {
        setShowInvoiceDatePicker(false);
        if (selectedDate) {
            setInvoice(prev => ({
                ...prev,
                invoiceDate: selectedDate
            }));
        }
    };

    const onDueDateChange = (event: any, selectedDate?: Date) => {
        setShowDueDatePicker(false);
        if (selectedDate) {
            setInvoice(prev => ({
                ...prev,
                dueDate: selectedDate
            }));
        }
    };

    const handleSubmit = async () => {
        const validationErrors = validateInvoice(invoice);
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            console.log('Validation errors:', validationErrors);
            return;
        }

        try {
            // Start a transaction
            const { data: insertedInvoice, error: invoiceError } = await supabase
                .from('invoices')
                .insert([{
                    invoice_id: invoice.invoiceId,
                    invoice_date: invoice.invoiceDate.toISOString(),
                    due_date: invoice.dueDate.toISOString(),
                    //vendor_name: invoice.vendorName,
                    //vendor_address: invoice.vendorAddress,
                    //customer_name: invoice.customerName,
                    //customer_address: invoice.customerAddress,
                    sub_total: invoice.subTotal,
                    tax: invoice.totalTax,
                    total: invoice.invoiceTotal,
                    //currency: invoice.currency
                }])
                .select()
                .single();

            if (invoiceError) throw invoiceError;

            // Insert invoice items with the invoice_id reference
            const { error: itemsError } = await supabase
                .from('items')
                .insert(
                    invoice.items.map(item => ({
                        invoice_id: insertedInvoice?.id,
                        description: item.description,
                        quantity: item.quantity,
                        unit: item.unit,
                        unit_price: item.unitPrice,
                    }))
                );

            if (itemsError) throw itemsError;

            // Navigate back to the invoices list on success
            router.push('/');
        } catch (error) {
            console.error('Error saving invoice:', error);
            setErrors({ submit: 'Failed to save invoice. Please try again.' });
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Add New Invoice</Text>
            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Invoice ID</Text>
                    <TextInput
                        style={[
                            styles.fullWidthInput,
                            errors.invoiceId && styles.inputError
                        ]}
                        placeholder="Invoice ID"
                        value={invoice.invoiceId}
                        onChangeText={(value) => handleInputChange('invoiceId', value)}
                    />
                    {errors.invoiceId && (
                        <Text style={styles.errorText}>{errors.invoiceId}</Text>
                    )}
                </View>

                <View style={styles.grid}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Invoice Date</Text>
                        <TouchableOpacity 
                            style={styles.input} 
                            onPress={() => setShowInvoiceDatePicker(true)}
                        >
                            <Text>{invoice.invoiceDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Due Date</Text>
                        <TouchableOpacity 
                            style={styles.input} 
                            onPress={() => setShowDueDatePicker(true)}
                        >
                            <Text>{invoice.dueDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                {showInvoiceDatePicker && (
                    <DateTimePicker
                        value={invoice.invoiceDate}
                        mode="date"
                        onChange={onInvoiceDateChange}
                    />
                )}

                {showDueDatePicker && (
                    <DateTimePicker
                        value={invoice.dueDate}
                        mode="date"
                        onChange={onDueDateChange}
                    />
                )}

                <View style={styles.itemsSection}>
                    <View style={styles.itemsHeader}>
                        <Text style={styles.subtitle}>Items</Text>
                        <View style={styles.headerRight}>
                            <TouchableOpacity style={styles.addButton} onPress={handleAddItem}>
                                <MaterialIcons name="add" size={24} color="white" />
                                <Text style={styles.buttonText}>Add Item</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {items.map((item, index) => (
                        <View key={index} style={styles.itemCard}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.itemDescription}>{item.description}</Text>
                                <TouchableOpacity 
                                    style={styles.deleteButton}
                                    onPress={() => handleDeleteItem(index)}
                                >
                                    <MaterialIcons name="delete-outline" size={24} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.itemDetails}>
                                <View style={styles.itemDetail}>
                                    <Text style={styles.detailLabel}>Quantity</Text>
                                    <Text style={styles.detailValue}>{item.quantity}</Text>
                                </View>
                                <View style={styles.itemDetail}>
                                    <Text style={styles.detailLabel}>Unit</Text>
                                    <Text style={styles.detailValue}>{item.unit}</Text>
                                </View>
                                <View style={styles.itemDetail}>
                                    <Text style={styles.detailLabel}>Unit Price</Text>
                                    <Text style={styles.detailValue}>${item.unitPrice}</Text>
                                </View>
                                <View style={styles.itemDetail}>
                                    <Text style={styles.detailLabel}>Total</Text>
                                    <Text style={styles.detailValue}>${item.quantity * item.unitPrice}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>

                <Modal
                    visible={isModalVisible}
                    animationType="slide"
                    transparent={true}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Add New Item</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Description"
                                value={currentItem.description}
                                onChangeText={(value) => setCurrentItem(prev => ({ ...prev, description: value }))}
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Quantity"
                                keyboardType="numeric"
                                value={currentItem.quantity}
                                onChangeText={(value) => setCurrentItem(prev => ({ ...prev, quantity: value }))}
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Unit"
                                value={currentItem.unit}
                                onChangeText={(value) => setCurrentItem(prev => ({ ...prev, unit: value }))}
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Unit Price"
                                keyboardType="numeric"
                                value={currentItem.unitPrice}
                                onChangeText={(value) => setCurrentItem(prev => ({ ...prev, unitPrice: value }))}
                            />
                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.cancelButton]} 
                                    onPress={() => setIsModalVisible(false)}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.modalButton, styles.saveButton]} 
                                    onPress={handleSaveItem}
                                >
                                    <Text style={styles.buttonText}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <View style={styles.totals}>
                    <Text>Subtotal: {invoice.subTotal}</Text>
                    <Text>Tax: {invoice.totalTax}</Text>
                    <Text>Total: {invoice.invoiceTotal}</Text>
                </View>

                {errors.submit && (
                    <Text style={styles.errorText}>{errors.submit}</Text>
                )}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Save Invoice</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    form: {
        gap: 16,
        paddingBottom: 32,
    },
    grid: {
        flexDirection: 'row',
        gap: 8,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
    },
    itemsSection: {
        marginTop: 24,
        gap: 16,
    },
    itemsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 12,
    },
    headerRight: {
        flexShrink: 0,
    },
    addButton: {
        backgroundColor: '#3b82f6',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 8,
        minWidth: 120,
    },
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemDescription: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        flex: 1,
    },
    deleteButton: {
        padding: 4,
    },
    itemDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    itemDetail: {
        minWidth: 100,
        flex: 1,
    },
    detailLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    detailValue: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
    },
    submitButton: {
        backgroundColor: '#22c55e',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    totals: {
        marginTop: 16,
        gap: 4,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        padding: 12,
        borderRadius: 4,
        marginBottom: 8,
    },
    tableHeaderCell: {
        flex: 1,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        alignItems: 'center',
    },
    tableCell: {
        flex: 1,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 12,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 16,
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        gap: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#6b7280',
    },
    saveButton: {
        backgroundColor: '#22c55e',
    },
    inputGroup: {
        flex: 1,
        gap: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
    },
    fullWidthInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
    },
    inputError: {
        borderColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 12,
        marginTop: 4,
    },
});