// src/routes/app/clients/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const STATUSES = ['Nouveau', 'Qualifié', 'Proposé', 'Gagné', 'Perdu'] as const;
type Status = (typeof STATUSES)[number];

function asStatus(v: unknown): Status {
  const s = String(v ?? '').trim() as Status;
  return (STATUSES as readonly string[]).includes(s) ? s : 'Nouveau';
}

function asNumber(v: unknown): number {
  // accepte "12 000", "12,000", "12000.50", etc.
  const raw = String(v ?? '0')
    .replace(/\s/g, '')
    .replace(/,/g, '.');
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = await locals.safeGetUser();
  if (!user) {
    return {
      q: '',
      status: 'all',
      statuses: STATUSES,
      clients: [],
      loadError: 'Non authentifié'
    };
  }

  const q = (url.searchParams.get('q') ?? '').trim();
  const status = (url.searchParams.get('status') ?? 'all').trim();

  let query = locals.supabase
    .from('clients')
    .select('id,name,company,status,value,created_at')
    .eq('user_id', user.id);

  if (q) {
    const like = `%${q}%`;
    query = query.or(`name.ilike.${like},company.ilike.${like}`);
  }

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  return {
    q,
    status,
    statuses: STATUSES,
    clients: (data ?? []) as Array<{
      id: string;
      name: string;
      company: string | null;
      status: Status;
      value: number | null;
      created_at: string;
    }>,
    loadError: error ? error.message : null
  };
};

export const actions: Actions = {
  create: async ({ locals, request }) => {
    const user = await locals.safeGetUser();
    if (!user) throw redirect(303, '/auth');

    const fd = await request.formData();
    const name = String(fd.get('name') ?? '').trim();
    const company = String(fd.get('company') ?? '').trim() || null;
    const status = asStatus(fd.get('status'));
    const value = asNumber(fd.get('value'));

    if (!name) {
      throw redirect(303, `/app/clients?toast=${encodeURIComponent('Nom requis')}&type=error`);
    }

    const { error } = await locals.supabase.from('clients').insert({
      user_id: user.id,
      name,
      company,
      status,
      value
    });

    if (error) {
      throw redirect(303, `/app/clients?toast=${encodeURIComponent(error.message)}&type=error`);
    }

    throw redirect(303, `/app/clients?toast=${encodeURIComponent('Client créé ✅')}&type=success`);
  },

  update: async ({ locals, request }) => {
    const user = await locals.safeGetUser();
    if (!user) throw redirect(303, '/auth');

    const fd = await request.formData();
    const id = String(fd.get('id') ?? '').trim();
    const name = String(fd.get('name') ?? '').trim();
    const company = String(fd.get('company') ?? '').trim() || null;
    const status = asStatus(fd.get('status'));
    const value = asNumber(fd.get('value'));

    if (!id || !name) {
      throw redirect(303, `/app/clients?toast=${encodeURIComponent('ID + nom requis')}&type=error`);
    }

    const { error } = await locals.supabase
      .from('clients')
      .update({ name, company, status, value })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw redirect(303, `/app/clients?toast=${encodeURIComponent(error.message)}&type=error`);
    }

    throw redirect(303, `/app/clients?toast=${encodeURIComponent('Client mis à jour ✅')}&type=success`);
  },

  remove: async ({ locals, request }) => {
    const user = await locals.safeGetUser();
    if (!user) throw redirect(303, '/auth');

    const fd = await request.formData();
    const id = String(fd.get('id') ?? '').trim();
    if (!id) throw redirect(303, `/app/clients?toast=${encodeURIComponent('ID requis')}&type=error`);

    const { error } = await locals.supabase.from('clients').delete().eq('id', id).eq('user_id', user.id);

    if (error) {
      throw redirect(303, `/app/clients?toast=${encodeURIComponent(error.message)}&type=error`);
    }

    throw redirect(303, `/app/clients?toast=${encodeURIComponent('Client supprimé ✅')}&type=success`);
  },

  quickStatus: async ({ locals, request }) => {
    const user = await locals.safeGetUser();
    if (!user) throw redirect(303, '/auth');

    const fd = await request.formData();
    const id = String(fd.get('id') ?? '').trim();
    const status = asStatus(fd.get('status'));

    if (!id) throw redirect(303, `/app/clients?toast=${encodeURIComponent('ID requis')}&type=error`);

    const { error } = await locals.supabase
      .from('clients')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      throw redirect(303, `/app/clients?toast=${encodeURIComponent(error.message)}&type=error`);
    }

    throw redirect(303, `/app/clients?toast=${encodeURIComponent('Statut mis à jour ✅')}&type=success`);
  }
};
