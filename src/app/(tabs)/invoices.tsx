import { useEffect, useState } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { supabase } from "../../lib/supabase";
import { Link } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Invoice } from "@/src/types/Invoice";

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.invoiceId}>#{item.invoice_id}</Text>
        <TouchableOpacity style={styles.viewButton}>
          <MaterialIcons name="chevron-right" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.dateContainer}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Invoice Date</Text>
          <Text style={styles.dateValue}>
            {new Date(item.invoice_date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Due Date</Text>
          <Text style={styles.dateValue}>
            {new Date(item.due_date).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.amountContainer}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Subtotal:</Text>
          <Text style={styles.amountValue}>{item.currency}{item.sub_total.toFixed(2)}</Text>
        </View>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Tax:</Text>
          <Text style={styles.amountValue}>{item.currency}{item.tax.toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{item.currency}{item.total.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Invoices</Text>
        <Link href="/add-invoice" asChild>
          <TouchableOpacity style={styles.addButton}>
            <MaterialIcons name="add" size={24} color="white" />
            <Text style={styles.buttonText}>New Invoice</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <FlashList
        data={invoices}
        renderItem={renderInvoice}
        estimatedItemSize={200}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4, // Add horizontal margin
    marginVertical: 6,   // Add some vertical spacing
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  invoiceId: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewButton: {
    padding: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  amountContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    gap: 8,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountLabel: {
    color: '#6b7280',
  },
  amountValue: {
    color: '#374151',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
});
