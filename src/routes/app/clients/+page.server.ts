// src/routes/app/clients/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';

const STATUSES = ['Nouveau', 'Qualifié', 'Proposé', 'Gagné', 'Perdu'] as const;
type Status = (typeof STATUSES)[number];

const isStatus = (v: unknown): v is Status => STATUSES.includes(v as Status);

const toStr = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');
const toValue = (v: FormDataEntryValue | null): number | null => {
  const s = toStr(v);
  if (!s) return null;
  const n = Number(String(s).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const withToast = (url: URL, toastMsg: string, type: 'success' | 'error' | 'info' = 'success') => {
  const u = new URL(url);
  u.searchParams.set('toast', toastMsg);
  u.searchParams.set('type', type);
  return u.pathname + u.search;
};

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

  if (status !== 'all') query = query.eq('status', status);

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
  create: async ({ locals, request, url }) => {
    const user = await locals.safeGetUser();
    if (!user) throw redirect(303, '/auth');

    const form = await request.formData();
    const name = toStr(form.get('name'));
    const company = toStr(form.get('company')) || null;

    const statusRaw = toStr(form.get('status')) || 'Nouveau';
    const status: Status = isStatus(statusRaw) ? statusRaw : 'Nouveau';

    const value = toValue(form.get('value'));

    if (!name) return fail(400, { message: 'Nom obligatoire' });

    const { error } = await locals.supabase.from('clients').insert({
      user_id: user.id,
      name,
      company,
      status,
      value
    });

    if (error) throw redirect(303, withToast(url, `Création échouée: ${error.message}`, 'error'));

    throw redirect(303, withToast(url, 'Client créé ✅', 'success'));
  },

  update: async ({ locals, request, url }) => {
    const user = await locals.safeGetUser();
    if (!user) throw redirect(303, '/auth');

    const form = await request.formData();
    const id = toStr(form.get('id'));
    const name = toStr(form.get('name'));
    const company = toStr(form.get('company')) || null;

    const statusRaw = toStr(form.get('status')) || 'Nouveau';
    const status: Status = isStatus(statusRaw) ? statusRaw : 'Nouveau';

    const value = toValue(form.get('value'));

    if (!id) return fail(400, { message: 'ID manquant' });
    if (!name) return fail(400, { message: 'Nom obligatoire' });

    const { error } = await locals.supabase
      .from('clients')
      .update({ name, company, status, value })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw redirect(303, withToast(url, `Update échoué: ${error.message}`, 'error'));

    throw redirect(303, withToast(url, 'Client modifié ✅', 'success'));
  },

  remove: async ({ locals, request, url }) => {
    const user = await locals.safeGetUser();
    if (!user) throw redirect(303, '/auth');

    const form = await request.formData();
    const id = toStr(form.get('id'));
    if (!id) return fail(400, { message: 'ID manquant' });

    // Supprimer les tâches liées (évite contraintes FK / RLS)
    const { error: tErr } = await locals.supabase
      .from('client_tasks')
      .delete()
      .eq('client_id', id)
      .eq('user_id', user.id);

    if (tErr) throw redirect(303, withToast(url, `Suppression tâches échouée: ${tErr.message}`, 'error'));

    const { error } = await locals.supabase.from('clients').delete().eq('id', id).eq('user_id', user.id);

    if (error) throw redirect(303, withToast(url, `Suppression échouée: ${error.message}`, 'error'));

    throw redirect(303, withToast(url, 'Client supprimé 🗑️', 'success'));
  },

  quickStatus: async ({ locals, request, url }) => {
    const user = await locals.safeGetUser();
    if (!user) throw redirect(303, '/auth');

    const form = await request.formData();
    const id = toStr(form.get('id'));
    const statusRaw = toStr(form.get('status'));

    if (!id) return fail(400, { message: 'ID manquant' });

    const status: Status = isStatus(statusRaw) ? statusRaw : 'Nouveau';

    const { error } = await locals.supabase
      .from('clients')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw redirect(303, withToast(url, `Statut échoué: ${error.message}`, 'error'));

    throw redirect(303, withToast(url, 'Statut mis à jour ✅', 'success'));
  }
};
