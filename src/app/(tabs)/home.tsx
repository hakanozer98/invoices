import { useEffect, useState, useRef } from "react";
import { Text, View, StyleSheet, ScrollView, Animated, Pressable } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { supabase } from "@/src/lib/supabase";
import analyzeDocument from "@/src/lib/scanInvoice";
import * as ImagePicker from 'expo-image-picker';
import Fab from '@/src/components/Fab';
import { router } from "expo-router";
import { Invoice } from "@/src/types/Invoice";

export default function Home() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].base64) {
      await handleImage(result.assets[0].base64);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0].base64) {
      await handleImage(result.assets[0].base64);
    }
  };

  const handleImage = async (base64Image: string) => {
    try {
      const result = await analyzeDocument(base64Image);
      console.log(JSON.stringify(result, null, 2));
      router.navigate({ pathname: "/add-invoice", params: { invoiceData: JSON.stringify(result) } });
    } catch (error) {
      console.error("Document analysis failed", error);
    }
  };

  const handleManualAdd = () => {
    router.navigate("/add-invoice");
  };

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const upcomingInvoices = invoices
    .filter(inv => new Date(inv.due_date) > new Date())
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3);

  const recentInvoices = invoices.slice(0, 5);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [200, 120],
    extrapolate: 'clamp',
  });

  const headerBackground = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: ['rgba(99, 102, 241, 1)', 'rgba(79, 70, 229, 1)'],
  });

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.header, 
          { 
            height: headerHeight,
            backgroundColor: headerBackground,
          }
        ]}
      >
        <Text style={styles.headerTitle}>Invoice Manager</Text>
        <Text style={styles.headerSubtitle}>Track your finances</Text>
      </Animated.View>

      <ScrollView 
        style={styles.scrollContainer}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
            <View style={[styles.cardContent, styles.cardPrimary]}>
              <Text style={styles.summaryLabel}>Total Invoices</Text>
              <Text style={styles.summaryValue}>{invoices.length}</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.summaryCard, { opacity: fadeAnim }]}>
            <View style={[styles.cardContent, styles.cardSecondary]}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>${totalAmount.toFixed(2)}</Text>
            </View>
          </Animated.View>
        </View>

        {/* Upcoming Invoices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Due Dates</Text>
          {upcomingInvoices.map((invoice, index) => (
            <Pressable 
              key={index}
              style={({ pressed }) => [
                styles.listItemContainer,
                pressed && styles.pressedItem
              ]}
            >
              <View style={styles.listItem}>
                <View style={styles.contentColumn}>
                  <View style={styles.listItemLeft}>
                    <View style={styles.dotIndicator} />
                    <Text style={styles.invoiceId}>#{invoice.invoice_id}</Text>
                  </View>
                  <Text style={styles.dueDate}>
                    Due: {new Date(invoice.due_date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.amountWrapper}>
                  <Text style={styles.amount}>{invoice.currency}</Text>
                  <Text style={styles.amount}>{invoice.total.toFixed(2)}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Recent Invoices */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Invoices</Text>
          {recentInvoices.map((invoice, index) => (
            <View key={index} style={[styles.listItem, styles.recentListItem]}>
              <View style={styles.contentColumn}>
                <Text style={styles.invoiceId}>#{invoice.invoice_id}</Text>
                <Text style={styles.date}>
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.amountWrapper}>
                <Text style={styles.amount}>{invoice.currency}</Text>
                <Text style={styles.amount}>{invoice.total.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <Fab onTakePhoto={takePhoto} onPickImage={pickImage} onManualAdd={handleManualAdd}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    justifyContent: 'flex-end',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 64
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 16,
    padding: 16,
    marginTop: 32,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardContent: {
    padding: 20,
    height: 140,
    justifyContent: 'center',
  },
  cardPrimary: {
    backgroundColor: '#4f46e5',
  },
  cardSecondary: {
    backgroundColor: '#6366f1',
  },
  dotIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
    marginRight: 12,
  },
  pressedItem: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  listItemContainer: {
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  recentListItem: {
    marginBottom: 12,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 18,
  },
  summaryValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  invoiceId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  dueDate: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  date: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  amountWrapper: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: 16, // reduced from 18
    fontWeight: '600',
    color: '#6366f1',
    lineHeight: 22, // reduced from 24
  },
  contentColumn: {
    flex: 1,
    gap: 4,
  },
});
