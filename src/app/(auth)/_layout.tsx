import { supabase } from '@/src/lib/supabase'
import { Session } from '@supabase/supabase-js'
import { Redirect, Stack } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { AppState } from 'react-native'

export default function AuthLayout() {

    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

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

    if (session && session.user) {
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