import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

const STATUSES = ['Nouveau', 'Qualifié', 'Proposé', 'Gagné', 'Perdu'] as const;
type Status = (typeof STATUSES)[number];

function parseValue(v: FormDataEntryValue | null) {
  const raw = String(v ?? '0').trim();
  // accepte "1 234", "1,234", "1234.56"
  const cleaned = raw.replace(/\s/g, '').replace(',', '.');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

async function requireUser(locals: App.Locals) {
  const { data, error } = await locals.supabase.auth.getUser();
  if (error || !data.user) throw redirect(303, '/auth');
  return data.user;
}

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = await requireUser(locals);

  // Supporte ?q=... et aussi ?query=... (au cas où)
  const q = (url.searchParams.get('q') ?? url.searchParams.get('query') ?? '').trim();
  const status = (url.searchParams.get('status') ?? 'all').trim();

  let query = locals.supabase
    .from('clients')
    .select('id,name,company,status,value,created_at')
    .eq('user_id', user.id)
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
    const user = await requireUser(locals);

    const form = await request.formData();
    const name = String(form.get('name') ?? '').trim();
    const company = String(form.get('company') ?? '').trim();
    const status = String(form.get('status') ?? 'Nouveau').trim();
    const value = parseValue(form.get('value'));

    if (!name) return fail(400, { error: 'Le nom est obligatoire.' });
    if (!STATUSES.includes(status as Status)) return fail(400, { error: 'Statut invalide.' });

    const { error } = await locals.supabase.from('clients').insert({
      user_id: user.id,
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
    const user = await requireUser(locals);

    const form = await request.formData();
    const id = String(form.get('id') ?? '').trim();
    const name = String(form.get('name') ?? '').trim();
    const company = String(form.get('company') ?? '').trim();
    const status = String(form.get('status') ?? '').trim();
    const value = parseValue(form.get('value'));

    if (!id) return fail(400, { error: 'ID manquant.' });
    if (!name) return fail(400, { error: 'Le nom est obligatoire.' });
    if (!STATUSES.includes(status as Status)) return fail(400, { error: 'Statut invalide.' });

    const { error } = await locals.supabase
      .from('clients')
      .update({ name, company: company || null, status, value })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return fail(400, { error: error.message });

    throw redirect(
      303,
      `/app/clients${url.search}${url.search ? '&' : '?'}toast=${encodeURIComponent('✅ Client mis à jour')}&type=success`
    );
  },

  remove: async ({ request, locals, url }) => {
    const user = await requireUser(locals);

    const form = await request.formData();
    const id = String(form.get('id') ?? '').trim();
    if (!id) return fail(400, { error: 'ID manquant.' });

    const { error } = await locals.supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return fail(400, { error: error.message });

    throw redirect(
      303,
      `/app/clients${url.search}${url.search ? '&' : '?'}toast=${encodeURIComponent('🗑️ Client supprimé')}&type=info`
    );
  }
};
