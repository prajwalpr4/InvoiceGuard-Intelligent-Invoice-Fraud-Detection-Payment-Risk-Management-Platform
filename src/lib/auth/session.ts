import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { DEMO_USERS, DEMO_ORG } from '@/lib/data/demo-data';
import { UserRole } from '@/types/database';

export interface CurrentUserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  department?: string;
  job_title?: string;
  organization: {
    id: string;
    name: string;
    currency: string;
  };
}

export async function getCurrentUserSession(): Promise<CurrentUserSession> {
  const cookieStore = await cookies();

  // 1. Check Supabase auth first (Real Supabase Auth User)
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const role = (user.user_metadata?.role as UserRole) || 'admin';
      return {
        id: user.id,
        email: user.email || 'user@company.com',
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Authorized User',
        role,
        avatar_url: user.user_metadata?.avatar_url || undefined,
        department: user.user_metadata?.department || 'Finance Operations',
        job_title: user.user_metadata?.job_title || 'Authorized Officer',
        organization: {
          id: DEMO_ORG.id,
          name: DEMO_ORG.name,
          currency: DEMO_ORG.currency,
        },
      };
    }
  } catch {
    // fallback
  }

  // 2. Check if demo session cookie exists (Fallback)
  const demoCookie = cookieStore.get('invoiceguard_demo_session');
  if (demoCookie?.value) {
    try {
      const parsed = JSON.parse(decodeURIComponent(demoCookie.value));
      const role = (parsed.role as UserRole) || 'admin';
      const demoUser = DEMO_USERS[role] || DEMO_USERS.admin;
      return {
        id: demoUser.profile.id,
        email: parsed.email || demoUser.profile.email,
        name: demoUser.profile.full_name,
        role: role,
        avatar_url: demoUser.profile.avatar_url || undefined,
        department: demoUser.profile.department || undefined,
        job_title: demoUser.profile.job_title || undefined,
        organization: {
          id: DEMO_ORG.id,
          name: DEMO_ORG.name,
          currency: DEMO_ORG.currency,
        },
      };
    } catch {
      // fallback
    }
  }

  // Default to CFO Admin for local exploration
  const defaultAdmin = DEMO_USERS.admin;
  return {
    id: defaultAdmin.profile.id,
    email: defaultAdmin.profile.email,
    name: defaultAdmin.profile.full_name,
    role: 'admin',
    avatar_url: defaultAdmin.profile.avatar_url || undefined,
    department: defaultAdmin.profile.department || undefined,
    job_title: defaultAdmin.profile.job_title || undefined,
    organization: {
      id: DEMO_ORG.id,
      name: DEMO_ORG.name,
      currency: DEMO_ORG.currency,
    },
  };
}

