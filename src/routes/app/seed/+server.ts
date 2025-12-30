import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

type InsertedClient = {
  id: string;
  company: string | null;
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

function addDaysISO(baseISO: string, days: number): string {
  const [y, m, d] = baseISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
  dt.setUTCDate(dt.getUTCDate() + days);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export const POST: RequestHandler = async ({ locals }) => {
  const session = await locals.getSession();
  if (!session) throw redirect(303, '/auth');

  // Idempotent: si la démo existe déjà, on ne réinjecte pas.
  const { data: existing, error: exErr } = await locals.supabase
    .from('clients')
    .select('id')
    .ilike('company', 'Demo —%')
    .limit(1);

  if (exErr) return new Response(`Erreur vérif seed: ${exErr.message}`, { status: 400 });

  if (existing && existing.length > 0) {
    throw redirect(303, '/app?toast=' + encodeURIComponent('ℹ️ Démo déjà chargée') + '&type=info');
  }

  const userId = session.user.id;
  const today = torontoTodayISO();

  const demoClients = [
    { user_id: userId, name: 'Jean Tremblay', company: 'Demo — Logia Inc.', status: 'Qualifié', value: 3500 },
    { user_id: userId, name: 'Aïcha Diallo', company: 'Demo — Nordik Studio', status: 'Proposé', value: 7200 },
    { user_id: userId, name: 'Marc Gagnon', company: 'Demo — Café Boréal', status: 'Nouveau', value: 1200 },
    { user_id: userId, name: 'Sofia Nguyen', company: 'Demo — Clinique Lumière', status: 'Qualifié', value: 5400 },
    { user_id: userId, name: 'Olivier Roy', company: 'Demo — Atelier Pixel', status: 'Gagné', value: 9800 },
    { user_id: userId, name: 'Fatou Koné', company: 'Demo — TransLog Québec', status: 'Perdu', value: 6000 }
  ] as const;

  const { data: insertedClientsRaw, error: cErr } = await locals.supabase
    .from('clients')
    .insert(demoClients)
    .select('id,company');

  if (cErr) return new Response(`Erreur seed clients: ${cErr.message}`, { status: 400 });

  const clients = (insertedClientsRaw ?? []) as InsertedClient[];

  const byCompany = (needle: string): string => {
    const id = clients.find((c: InsertedClient) => (c.company ?? '').includes(needle))?.id;
    if (!id) throw new Error(`Seed: client introuvable pour "${needle}"`);
    return id;
  };

  const idLogia = byCompany('Logia');
  const idNordik = byCompany('Nordik');
  const idCafe = byCompany('Café');
  const idClinique = byCompany('Clinique');
  const idAtelier = byCompany('Atelier');
  const idTranslog = byCompany('TransLog');

  const demoNotes = [
    { user_id: userId, client_id: idLogia, content: 'Appel de découverte: besoin CRM léger + export CSV. Décisionnaire: CTO. Next step: proposition.' },
    { user_id: userId, client_id: idNordik, content: 'Brief: refonte landing + intégration analytics. Budget confirmé. Attente: maquette + timeline.' },
    { user_id: userId, client_id: idCafe, content: 'Prospect chaud: veut système de réservation simple. À qualifier (budget, délais, stack).' },
    { user_id: userId, client_id: idClinique, content: 'Problème: prise de RDV + rappels SMS. Contraintes: données sensibles → validation sécurité.' },
    { user_id: userId, client_id: idAtelier, content: 'Deal gagné: livraison v1 validée. À préparer: maintenance + évolutions (SEO, performance).' },
    { user_id: userId, client_id: idTranslog, content: 'Deal perdu: délais trop courts, budget insuffisant. À relancer dans 2-3 mois.' }
  ] as const;

  const { error: nErr } = await locals.supabase.from('client_notes').insert(demoNotes);
  if (nErr) return new Response(`Erreur seed notes: ${nErr.message}`, { status: 400 });

  const demoTasks = [
    { user_id: userId, client_id: idNordik, title: 'Envoyer la proposition + devis', done: false, due_date: today },
    { user_id: userId, client_id: idLogia, title: 'Préparer démo rapide (dashboard + CSV)', done: false, due_date: addDaysISO(today, 2) },
    { user_id: userId, client_id: idClinique, title: 'Checklist sécurité + questions conformité', done: false, due_date: addDaysISO(today, 1) },
    { user_id: userId, client_id: idCafe, title: 'Qualifier: budget / timeline / scope', done: false, due_date: addDaysISO(today, 3) },
    { user_id: userId, client_id: idTranslog, title: 'Relance soft (suivi dans 60 jours)', done: false, due_date: addDaysISO(today, 60) },
    { user_id: userId, client_id: idAtelier, title: 'Envoyer plan de maintenance', done: true, due_date: addDaysISO(today, -2) },
    { user_id: userId, client_id: idLogia, title: 'Relance CTO (si pas de réponse)', done: false, due_date: addDaysISO(today, -1) }
  ] as const;

  const { error: tErr } = await locals.supabase.from('client_tasks').insert(demoTasks);
  if (tErr) return new Response(`Erreur seed tâches: ${tErr.message}`, { status: 400 });

  throw redirect(303, '/app?toast=' + encodeURIComponent('✅ Démo chargée') + '&type=success');
};
