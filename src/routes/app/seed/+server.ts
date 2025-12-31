// src/routes/app/seed/+server.ts
import { dev } from '$app/environment';
import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

type Status = 'Nouveau' | 'Qualifié' | 'Proposé' | 'Gagné' | 'Perdu';

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

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const POST: RequestHandler = async ({ locals }) => {
  // ✅ PROD: endpoint seed complètement bloqué
  if (!dev) {
    throw error(404, 'Not found');
  }

  // ✅ DEV: seed autorisé (comme avant)
  const { data, error: authErr } = await locals.supabase.auth.getUser();
  if (authErr || !data.user) throw redirect(303, '/auth');
  const user = data.user;

  const today = torontoTodayISO();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  const { error: delTasksErr } = await locals.supabase
    .from('client_tasks')
    .delete()
    .eq('user_id', user.id);

  if (delTasksErr) {
    throw redirect(
      303,
      `/app?toast=${encodeURIComponent('Seed: suppression tâches échouée: ' + delTasksErr.message)}&type=error`
    );
  }

  const { error: delClientsErr } = await locals.supabase
    .from('clients')
    .delete()
    .eq('user_id', user.id);

  if (delClientsErr) {
    throw redirect(
      303,
      `/app?toast=${encodeURIComponent('Seed: suppression clients échouée: ' + delClientsErr.message)}&type=error`
    );
  }

  const demoClients = [
    { user_id: user.id, name: 'Marc Tremblay', company: 'Logia Inc.', status: 'Qualifié' as Status, value: 12000 },
    { user_id: user.id, name: 'Sarah Nguyen', company: 'Nordik Studio', status: 'Proposé' as Status, value: 18500 },
    { user_id: user.id, name: 'Jean Dupont', company: 'BorealTech', status: 'Nouveau' as Status, value: 5000 },
    { user_id: user.id, name: 'Amina Diallo', company: 'Maple Retail', status: 'Gagné' as Status, value: 24000 },
    { user_id: user.id, name: 'Olivier Roy', company: null, status: 'Perdu' as Status, value: 8000 }
  ];

  const { data: insertedClients, error: cErr } = await locals.supabase
    .from('clients')
    .insert(demoClients)
    .select('id');

  if (cErr) {
    throw redirect(303, `/app?toast=${encodeURIComponent('Seed échoué (clients): ' + cErr.message)}&type=error`);
  }

  const ids = (insertedClients ?? []).map((x: any) => x.id).filter(Boolean);

  if (ids.length > 0) {
    const tasks = [
      { user_id: user.id, client_id: ids[0], title: 'Relancer par email', done: false, due_date: today },
      { user_id: user.id, client_id: ids[1] ?? ids[0], title: 'Préparer le devis', done: false, due_date: tomorrow },
      { user_id: user.id, client_id: ids[2] ?? ids[0], title: 'Appel découverte', done: false, due_date: yesterday },
      { user_id: user.id, client_id: ids[0], title: 'Renseigner les besoins', done: true, due_date: null },
      { user_id: user.id, client_id: ids[3] ?? ids[0], title: 'Planifier kick-off', done: false, due_date: null }
    ];

    const { error: tErr } = await locals.supabase.from('client_tasks').insert(tasks);

    if (tErr) {
      throw redirect(303, `/app?toast=${encodeURIComponent('Seed échoué (tâches): ' + tErr.message)}&type=error`);
    }
  }

  throw redirect(303, `/app?toast=${encodeURIComponent('Démo chargée ✅')}&type=success`);
};
