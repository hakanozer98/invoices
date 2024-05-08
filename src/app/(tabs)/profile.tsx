import { supabase } from "@/src/lib/supabase";
import { useAuth } from "@/src/providers/AuthProvider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, View, Text, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
    const { user } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.profileCard}>
                <MaterialCommunityIcons name="account-circle" size={100} color="#6366f1" style={styles.avatar} />
                <Text style={styles.username}>{user?.email || 'User'}</Text>
                <Button 
                    title="Sign Out" 
                    onPress={() => supabase.auth.signOut()} 
                    color="#FF5A5F"
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    profileCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
});
