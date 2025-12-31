// src/app.d.ts
import type { SupabaseClient, User } from '@supabase/supabase-js';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      safeGetUser: () => Promise<User | null>;
    }
  }
}

export {};
