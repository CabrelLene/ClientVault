// src/routes/app/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type Status = 'Nouveau' | 'Qualifié' | 'Proposé' | 'Gagné' | 'Perdu';

type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  status: Status;
  value: number | null;
  created_at: string;
};

type TaskRow = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  client_id: string;
  created_at: string;
};

const STATUSES = ['Nouveau', 'Qualifié', 'Proposé', 'Gagné', 'Perdu'] as const;

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

function num(v: unknown): number {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
}

async function requireUser(locals: App.Locals) {
  const { data, error } = await locals.supabase.auth.getUser();
  if (error || !data.user) throw redirect(303, '/auth');
  return data.user;
}

export const load: PageServerLoad = async ({ locals }) => {
  const user = await requireUser(locals);
  const today = torontoTodayISO();

  // 1) Clients (scopé user)
  const { data: clientsRaw, error: cErr } = await locals.supabase
    .from('clients')
    .select('id,name,company,status,value,created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (cErr) {
    return {
      today,
      error: cErr.message,
      kpis: null,
      pipelineByStatus: [],
      topClients: [],
      recentClients: [],
      taskHighlights: null
    };
  }

  const clients = (clientsRaw ?? []) as ClientRow[];
  const clientIds = clients.map((c) => c.id);

  // 2) Tasks (scopées user_id + seulement pour MES clients)
  let tasks: TaskRow[] = [];

  if (clientIds.length > 0) {
    const { data: tasksRaw, error: tErr } = await locals.supabase
      .from('client_tasks')
      .select('id,title,done,due_date,client_id,created_at')
      .eq('user_id', user.id) // ✅ IMPORTANT (sécurité + RLS)
      .in('client_id', clientIds)
      .order('created_at', { ascending: false });

    if (tErr) {
      return {
        today,
        error: tErr.message,
        kpis: null,
        pipelineByStatus: [],
        topClients: [],
        recentClients: clients.slice(0, 6),
        taskHighlights: null
      };
    }

    tasks = (tasksRaw ?? []) as TaskRow[];
  }

  // 3) KPIs + pipeline by status
  const statusCount: Record<Status, number> = {
    Nouveau: 0,
    Qualifié: 0,
    Proposé: 0,
    Gagné: 0,
    Perdu: 0
  };

  const statusValue: Record<Status, number> = {
    Nouveau: 0,
    Qualifié: 0,
    Proposé: 0,
    Gagné: 0,
    Perdu: 0
  };

  let totalValue = 0;
  let openValue = 0;
  let wonValue = 0;
  let lostValue = 0;

  for (const c of clients) {
    const v = num(c.value);
    totalValue += v;

    statusCount[c.status] += 1;
    statusValue[c.status] += v;

    if (c.status === 'Gagné') wonValue += v;
    else if (c.status === 'Perdu') lostValue += v;
    else openValue += v;
  }

  const decided = statusCount.Gagné + statusCount.Perdu;
  const winRate = decided > 0 ? Math.round((statusCount.Gagné / decided) * 100) : 0;

  const openTasks = tasks.filter((t) => !t.done);
  const overdue = openTasks.filter((t) => t.due_date && t.due_date < today);
  const dueToday = openTasks.filter((t) => t.due_date === today);
  const noDue = openTasks.filter((t) => !t.due_date);

  const pipelineByStatus = STATUSES.map((s) => ({
    status: s,
    count: statusCount[s],
    value: statusValue[s]
  }));

  const topClients = [...clients].sort((a, b) => num(b.value) - num(a.value)).slice(0, 5);

  const kpis = {
    totalClients: clients.length,
    totalValue,
    openValue,
    wonValue,
    lostValue,
    winRate,
    openTasks: openTasks.length,
    overdueTasks: overdue.length,
    dueTodayTasks: dueToday.length
  };

  return {
    today,
    error: null,
    kpis,
    pipelineByStatus,
    topClients,
    recentClients: clients.slice(0, 6),
    taskHighlights: {
      overdue: overdue.slice(0, 5),
      dueToday: dueToday.slice(0, 5),
      noDue: noDue.slice(0, 5)
    }
  };
};
