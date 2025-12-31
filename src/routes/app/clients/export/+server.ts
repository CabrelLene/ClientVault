// src/routes/app/clients/export/+server.ts
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type Status = 'Nouveau' | 'Qualifié' | 'Proposé' | 'Gagné' | 'Perdu';

type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  status: Status;
  value: number | null;
  created_at: string;
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

function csvEscape(v: unknown): string {
  const s = String(v ?? '');
  // CSV standard: si virgule, guillemet, ou newline => wrap "..." et double les "
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCSV(rows: ClientRow[]): string {
  const header = ['id', 'name', 'company', 'status', 'value', 'created_at'];
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [
        csvEscape(r.id),
        csvEscape(r.name),
        csvEscape(r.company ?? ''),
        csvEscape(r.status),
        csvEscape(Number(r.value) || 0),
        csvEscape(r.created_at)
      ].join(',')
    )
  ];
  // BOM UTF-8 pour Excel (sinon accents parfois cassés)
  return '\uFEFF' + lines.join('\n');
}

async function exportClientsCSV(locals: App.Locals): Promise<Response> {
  // ✅ Auth server-side
  const { data, error } = await locals.supabase.auth.getUser();
  if (error || !data.user) throw redirect(303, '/auth');
  const user = data.user;

  // ✅ Fetch clients du user
  const { data: rows, error: qErr } = await locals.supabase
    .from('clients')
    .select('id,name,company,status,value,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (qErr) {
    // on redirige proprement avec toast, mais en "throw"
    throw redirect(
      303,
      `/app/clients?toast=${encodeURIComponent('Export CSV échoué: ' + qErr.message)}&type=error`
    );
  }

  const csv = toCSV((rows ?? []) as ClientRow[]);
  const filename = `clients_${torontoTodayISO()}.csv`;

  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="${filename}"`
    }
  });
}

// ✅ IMPORTANT: on RETURN une Response (pas void)
export const GET: RequestHandler = async ({ locals }) => {
  return exportClientsCSV(locals);
};

export const POST: RequestHandler = async ({ locals }) => {
  return exportClientsCSV(locals);
};
