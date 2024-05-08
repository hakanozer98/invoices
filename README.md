# Invoice Manager App

A modern, mobile-first invoice management application built with Expo and React Native. This app helps to create, manage, and track invoices efficiently.

## Features

- 📱 Cross-platform support (iOS, Android)
- 📸 Scan invoices using device camera
- 📊 Dashboard with financial insights
- 💰 Multi-currency support
- 📅 Due date tracking
- 🔐 Secure authentication with Supabase
- 💾 Cloud storage for invoices

## Tech Stack

- Expo Framework
- React Native
- TypeScript
- Supabase (Backend & Authentication)
- Azure Document Intelligence (Invoice scanning)
- Expo Router (File-based routing)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Supabase account
- Azure account (for document scanning features)

## Environment Setup

1. Create a `.env` file in the root directory:
- EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
- EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
- EXPO_PUBLIC_DI_ENDPOINT=your_azure_document_intelligence_endpoint
- EXPO_PUBLIC_DI_KEY=your_azure_document_intelligence_key