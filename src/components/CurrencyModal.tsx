
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Currency } from '../data/currencies';

type CurrencyModalProps = {
    visible: boolean;
    currencies: Currency[];
    selectedCurrency: string;
    onSelect: (currency: Currency) => void;
    onClose: () => void;
};

export default function CurrencyModal({ 
    visible, 
    currencies, 
    selectedCurrency, 
    onSelect, 
    onClose 
}: CurrencyModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Select Currency</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={currencies}
                        keyExtractor={(item) => item.code}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.currencyItem,
                                    selectedCurrency === item.code && styles.selectedItem
                                ]}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Text style={styles.currencyCode}>{item.code}</Text>
                                <Text style={styles.currencyName}>{item.name}</Text>
                                <Text style={styles.currencySymbol}>{item.symbol}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        fontSize: 20,
        color: '#6b7280',
        padding: 4,
    },
    currencyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    selectedItem: {
        backgroundColor: '#f3f4f6',
    },
    currencyCode: {
        fontWeight: 'bold',
        width: 60,
    },
    currencyName: {
        flex: 1,
        marginLeft: 12,
    },
    currencySymbol: {
        fontSize: 16,
        marginLeft: 12,
    },
});