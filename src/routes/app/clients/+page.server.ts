import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const STATUSES = ['Nouveau', 'Qualifié', 'Proposé', 'Gagné', 'Perdu'] as const;

function parseValue(v: FormDataEntryValue | null) {
  const n = Number(String(v ?? '0').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const session = await locals.getSession();
  if (!session) throw redirect(303, '/auth');

  const q = (url.searchParams.get('q') ?? '').trim();
  const status = (url.searchParams.get('status') ?? 'all').trim();

  let query = locals.supabase
    .from('clients')
    .select('id,name,company,status,value,created_at')
    .order('created_at', { ascending: false });

  if (q) {
    const like = `%${q}%`;
    query = query.or(`name.ilike.${like},company.ilike.${like}`);
  }
  if (status && status !== 'all') query = query.eq('status', status);

  const { data: clients, error } = await query;

  return {
    q,
    status,
    statuses: STATUSES,
    clients: clients ?? [],
    loadError: error?.message ?? null
  };
};

export const actions: Actions = {
  create: async ({ request, locals, url }) => {
    const session = await locals.getSession();
    if (!session) throw redirect(303, '/auth');

    const form = await request.formData();
    const name = String(form.get('name') ?? '').trim();
    const company = String(form.get('company') ?? '').trim();
    const status = String(form.get('status') ?? 'Nouveau').trim();
    const value = parseValue(form.get('value'));

    if (!name) return fail(400, { error: 'Le nom est obligatoire.' });
    if (!STATUSES.includes(status as any)) return fail(400, { error: 'Statut invalide.' });

    const { error } = await locals.supabase.from('clients').insert({
      user_id: session.user.id,
      name,
      company: company || null,
      status,
      value
    });

    if (error) return fail(400, { error: error.message });

    throw redirect(
      303,
      `/app/clients${url.search}${url.search ? '&' : '?'}toast=${encodeURIComponent('✅ Client créé')}&type=success`
    );
  },

  update: async ({ request, locals, url }) => {
    const session = await locals.getSession();
    if (!session) throw redirect(303, '/auth');

    const form = await request.formData();
    const id = String(form.get('id') ?? '').trim();
    const name = String(form.get('name') ?? '').trim();
    const company = String(form.get('company') ?? '').trim();
    const status = String(form.get('status') ?? '').trim();
    const value = parseValue(form.get('value'));

    if (!id) return fail(400, { error: 'ID manquant.' });
    if (!name) return fail(400, { error: 'Le nom est obligatoire.' });
    if (!STATUSES.includes(status as any)) return fail(400, { error: 'Statut invalide.' });

    const { error } = await locals.supabase
      .from('clients')
      .update({ name, company: company || null, status, value })
      .eq('id', id);

    if (error) return fail(400, { error: error.message });

    throw redirect(
      303,
      `/app/clients${url.search}${url.search ? '&' : '?'}toast=${encodeURIComponent('✅ Client mis à jour')}&type=success`
    );
  },

  remove: async ({ request, locals, url }) => {
    const session = await locals.getSession();
    if (!session) throw redirect(303, '/auth');

    const form = await request.formData();
    const id = String(form.get('id') ?? '').trim();
    if (!id) return fail(400, { error: 'ID manquant.' });

    const { error } = await locals.supabase.from('clients').delete().eq('id', id);
    if (error) return fail(400, { error: error.message });

    throw redirect(
      303,
      `/app/clients${url.search}${url.search ? '&' : '?'}toast=${encodeURIComponent('🗑️ Client supprimé')}&type=info`
    );
  }
};
