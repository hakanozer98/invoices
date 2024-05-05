import { StyleSheet, View, Pressable, Text } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';

interface FabProps {
    onTakePhoto: () => void;
    onPickImage: () => void;
    onManualAdd: () => void;
}

export default function Fab({ onTakePhoto, onPickImage, onManualAdd }: FabProps) {
    const [isFabOpen, setIsFabOpen] = useState(false);

    const FabMenu = () => {
        return (
            <Animated.View entering={SlideInRight} exiting={SlideOutRight} style={styles.fabMenu}>
                <Pressable style={styles.fabOption} onPress={onManualAdd}>
                    <AntDesign name="form" size={24} color="white" />
                    <Text style={styles.fabText}>Manual</Text>
                </Pressable>
                <Pressable style={styles.fabOption} onPress={onTakePhoto}>
                    <AntDesign name="camera" size={24} color="white" />
                    <Text style={styles.fabText}>Take Photo</Text>
                </Pressable>
                <Pressable style={styles.fabOption} onPress={onPickImage}>
                    <AntDesign name="picture" size={24} color="white" />
                    <Text style={styles.fabText}>Choose Photo</Text>
                </Pressable>
            </Animated.View>
        )
    };

    return (
        <>
            {isFabOpen && <FabMenu />}
            <Pressable
                style={styles.fab}
                onPress={() => setIsFabOpen(!isFabOpen)}
            >
                <AntDesign name="plus" size={24} color="white" />
            </Pressable>
        </>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: '#007AFF',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabMenu: {
        position: 'absolute',
        bottom: 80,
        right: 16,
        gap: 8,
    },
    fabOption: {
        backgroundColor: '#007AFF',
        flexDirection: 'row',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        gap: 8,
    },
    fabText: {
        color: 'white',
        fontSize: 16,
    },
});