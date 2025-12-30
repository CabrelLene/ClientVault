import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  status: string;
  value: number;
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

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  if (!session) throw redirect(303, '/auth');

  const today = torontoTodayISO();

  const { data: clientsRaw, error: cErr } = await locals.supabase
    .from('clients')
    .select('id,name,company,status,value,created_at')
    .order('created_at', { ascending: false });

  if (cErr) {
    return { today, error: cErr.message, kpis: null, statusCount: {}, recentClients: [], taskHighlights: null };
  }

  const { data: tasksRaw, error: tErr } = await locals.supabase
    .from('client_tasks')
    .select('id,title,done,due_date,client_id,created_at')
    .order('created_at', { ascending: false });

  if (tErr) {
    return { today, error: tErr.message, kpis: null, statusCount: {}, recentClients: [], taskHighlights: null };
  }

  const clients = (clientsRaw ?? []) as ClientRow[];
  const tasks = (tasksRaw ?? []) as TaskRow[];

  const statusCount: Record<string, number> = {};
  let totalValue = 0;
  let openValue = 0;
  let wonValue = 0;
  let lostValue = 0;

  for (const c of clients) {
    const v = Number(c.value) || 0;
    totalValue += v;
    statusCount[c.status] = (statusCount[c.status] ?? 0) + 1;

    if (c.status === 'Gagné') wonValue += v;
    else if (c.status === 'Perdu') lostValue += v;
    else openValue += v;
  }

  const wonCount = statusCount['Gagné'] ?? 0;
  const lostCount = statusCount['Perdu'] ?? 0;
  const decided = wonCount + lostCount;
  const winRate = decided > 0 ? Math.round((wonCount / decided) * 100) : 0;

  const openTasks = tasks.filter((t: TaskRow) => !t.done);
  const overdue = openTasks.filter((t: TaskRow) => t.due_date && t.due_date < today);
  const dueToday = openTasks.filter((t: TaskRow) => t.due_date === today);
  const noDue = openTasks.filter((t: TaskRow) => !t.due_date);

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
    statusCount,
    recentClients: clients.slice(0, 6),
    taskHighlights: {
      overdue: overdue.slice(0, 5),
      dueToday: dueToday.slice(0, 5),
      noDue: noDue.slice(0, 5)
    }
  };
};
