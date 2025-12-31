// src/routes/app/clients/[id]/+page.server.ts
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

function torontoTodayISO(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const m = parts.find((p) => p.type === 'month')?.value ?? '01';
  const d = parts.find((p) => p.type === 'day')?.value ?? '01';
  return `${y}-${m}-${d}`;
}

const withToast = (url: URL, msg: string, type: 'success' | 'error' | 'info' = 'success') => {
  const u = new URL(url);
  u.searchParams.set('toast', msg);
  u.searchParams.set('type', type);
  return u.pathname + u.search;
};

export const load: PageServerLoad = async ({ locals, params }) => {
  const user = await locals.safeGetUser();
  if (!user) throw redirect(303, '/auth');

  const id = params.id;

  const { data: client, error: cErr } = await locals.supabase
    .from('clients')
    .select('id,name,company,status,value,created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle();

  if (cErr) {
    return { today: torontoTodayISO(), statuses: STATUSES, client: null, tasks: [], loadError: cErr.message };
  }

  if (!client) {
    return { today: torontoTodayISO(), statuses: STATUSES, client: null, tasks: [], loadError: 'Client introuvable' };
  }

  const { data: tasks, error: tErr } = await locals.supabase
    .from('client_tasks')
    .select('id,title,done,due_date,created_at')
    .eq('client_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return {
    today: torontoTodayISO(),
    statuses: STATUSES,
    client: client as {
      id: string;
      name: string;
      company: string | null;
      status: Status;
      value: number | null;
      created_at: string;
    },
    tasks: (tasks ?? []) as Array<{
      id: string;
      title: string;
      done: boolean;
      due_date: string | null;
      created_at: string;
    }>,
    loadError: tErr ? tErr.message : null
  };
};

export const actions: Actions = {
  updateClient: async ({ locals, request, url, params }) => {
    const user = await locals.safeGetUser();
    if (!user) throw redirect(303, '/auth');

    const id = params.id;
    const form = await request.formData();

    const name = toStr(form.get('name'));
    const company = toStr(form.get('company')) || null;

    const statusRaw = toStr(form.get('status')) || 'Nouveau';
    const status: Status = isStatus(statusRaw) ? statusRaw : 'Nouveau';

    const value = toValue(form.get('value'));

    if (!name) return fail(400, { message: 'Nom obligatoire' });

    const { error } = await locals.supabase
      .from('clients')
      .update({ name, company, status, value })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw redirect(303, withToast(url, `Update échoué: ${error.message}`, 'error'));

    throw redirect(303, withToast(url, 'Client mis à jour ✅', 'success'));
  },

  deleteClient: async ({ locals, url, params }) => {
    const user = await locals.safeGetUser();
    if (!user) throw redirect(303, '/auth');

    const id = params.id;

    const { error: tErr } = await locals.supabase
      .from('client_tasks')
      .delete()
      .eq('client_id', id)
      .eq('user_id', user.id);

    if (tErr) throw redirect(303, withToast(url, `Suppression tâches échouée: ${tErr.message}`, 'error'));

    const { error } = await locals.supabase.from('clients').delete().eq('id', id).eq('user_id', user.id);

    if (error) throw redirect(303, withToast(url, `Suppression client échouée: ${error.message}`, 'error'));

    throw redirect(303, withToast(new URL('/app/clients', url), 'Client supprimé 🗑️', 'success'));
  },

  addTask: async ({ locals, request, url, params }) => {
    const user = await locals.safeGetUser();
    if (!user) throw redirect(303, '/auth');

    const client_id = params.id;
    const form = await request.formData();

    const title = toStr(form.get('title'));
    const due_date = toStr(form.get('due_date')) || null;

    if (!title) return fail(400, { message: 'Titre de tâche obligatoire' });

    const { error } = await locals.supabase.from('client_tasks').insert({
      user_id: user.id,
      client_id,
      title,
      done: false,
      due_date
    });

    if (error) throw redirect(303, withToast(url, `Ajout tâche échoué: ${error.message}`, 'error'));

    throw redirect(303, withToast(url, 'Tâche ajoutée ✅', 'success'));
  },

  toggleTask: async ({ locals, request, url }) => {
    const user = await locals.safeGetUser();
    if (!user) throw redirect(303, '/auth');

    const form = await request.formData();
    const id = toStr(form.get('id'));
    const done = toStr(form.get('done')) === 'true';

    if (!id) return fail(400, { message: 'ID tâche manquant' });

    const { error } = await locals.supabase.from('client_tasks').update({ done }).eq('id', id).eq('user_id', user.id);

    if (error) throw redirect(303, withToast(url, `Update tâche échoué: ${error.message}`, 'error'));

    throw redirect(303, withToast(url, 'Tâche mise à jour ✅', 'success'));
  },

  deleteTask: async ({ locals, request, url }) => {
    const user = await locals.safeGetUser();
    if (!user) throw redirect(303, '/auth');

    const form = await request.formData();
    const id = toStr(form.get('id'));
    if (!id) return fail(400, { message: 'ID tâche manquant' });

    const { error } = await locals.supabase.from('client_tasks').delete().eq('id', id).eq('user_id', user.id);

    if (error) throw redirect(303, withToast(url, `Suppression tâche échouée: ${error.message}`, 'error'));

    throw redirect(303, withToast(url, 'Tâche supprimée 🗑️', 'success'));
  }
};
