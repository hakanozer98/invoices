import { supabase } from "@/src/lib/supabase";
import { Button, View } from "react-native";

export default function Profile() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Button title="Sign Out" onPress={() => supabase.auth.signOut()} />
        </View>
    );
}
