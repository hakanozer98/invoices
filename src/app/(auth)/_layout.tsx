import { supabase } from '@/src/lib/supabase'
import { useAuth } from '@/src/providers/AuthProvider'
import { Redirect, Stack } from 'expo-router'
import React, { useEffect } from 'react'
import { AppState } from 'react-native'

export default function AuthLayout() {
    const { isAuthenticated } = useAuth()

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                supabase.auth.startAutoRefresh()
            } else {
                supabase.auth.stopAutoRefresh()
            }
        })

        return () => {
            subscription.remove()
        }
    }, [])

    if (isAuthenticated) {
        return <Redirect href="/(tabs)/home" />
    } else {
        return (
            <Stack>
                <Stack.Screen name="signUp" options={{headerShown: false}} />
                <Stack.Screen name="signIn" options={{headerShown: false}} />
            </Stack>
        )
    }
}