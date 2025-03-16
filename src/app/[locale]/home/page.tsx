'use client';

import React from 'react';
import { AuthGuard } from '@/guards/auth.guard';

export default function Home() {
  return <AuthGuard>Home page</AuthGuard>;
}
