import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  status: string;
  value: number;
  created_at: string;
};

function escapeCSV(value: unknown): string {
  const s = String(value ?? '');
  const needsWrap = /[",\n\r;]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsWrap ? `"${escaped}"` : escaped;
}

export const GET: RequestHandler = async ({ locals, url }) => {
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

  const { data, error } = await query;
  if (error) return new Response(`Erreur export: ${error.message}`, { status: 400 });

  const rows = (data ?? []) as ClientRow[];

  const header = ['id', 'name', 'company', 'status', 'value', 'created_at'].join(';');
  const lines = rows.map((r: ClientRow) =>
    [r.id, r.name, r.company ?? '', r.status, r.value ?? 0, r.created_at].map(escapeCSV).join(';')
  );

  const csv = '\uFEFF' + [header, ...lines].join('\n');
  const filename = `clientvault-clients-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`
    }
  });
};
