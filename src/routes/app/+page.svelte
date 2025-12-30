<script lang="ts">
  import KpiCard from '$lib/components/KpiCard.svelte';
  import StatusPill from '$lib/components/StatusPill.svelte';

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

  type Data = {
    today: string;
    error: string | null;
    kpis: null | {
      totalClients: number;
      totalValue: number;
      openValue: number;
      wonValue: number;
      lostValue: number;
      winRate: number;
      openTasks: number;
      overdueTasks: number;
      dueTodayTasks: number;
    };
    statusCount: Record<string, number>;
    recentClients: ClientRow[];
    taskHighlights: null | {
      overdue: TaskRow[];
      dueToday: TaskRow[];
      noDue: TaskRow[];
    };
  };

  let { data } = $props<{ data: Data }>();

  const money = (n: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n || 0);

  const pct = (n: number) => `${Math.max(0, Math.min(100, n || 0))}%`;

  const pipeOrder = ['Nouveau', 'Qualifié', 'Proposé', 'Gagné', 'Perdu'];

  const pipe = (counts: Record<string, number>) =>
    pipeOrder.map((s) => ({ status: s, count: counts[s] ?? 0 }));
</script>

{#if data.error}
  <div class="err">
    <div class="err__title">Erreur</div>
    <div class="err__text">{data.error}</div>
  </div>
{:else if !data.kpis}
  <div class="loading">Chargement…</div>
{:else}
  <div class="grid">
    <section class="hero">
      <div class="hero__left">
        <div class="badge">📌 Aujourd’hui : <b>{data.today}</b></div>
        <h1 class="h1">Dashboard</h1>
        <p class="p">
          Suivi clair des prospects, valeur de pipeline, et tâches à risque.
        </p>

        <div class="quick">
          <a class="btn" href="/app/clients">Voir les clients</a>
          <a class="btn btn--ghost" href="/app/clients?status=Proposé">Propositions</a>
        </div>
      </div>

      <div class="hero__right">
        <div class="pipe">
          <div class="pipe__title">Pipeline</div>
          <div class="pipe__list">
            {#each pipe(data.statusCount) as s}
              <div class="pipe__row">
                <StatusPill status={s.status} />
                <div class="pipe__count">{s.count}</div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </section>

    <section class="kpis">
      <KpiCard title="Clients" value={String(data.kpis.totalClients)} hint="Total dans ton CRM" icon="👥" />
      <KpiCard title="Valeur totale" value={money(data.kpis.totalValue)} hint="Pipeline + deals" icon="💰" />
      <KpiCard title="En cours" value={money(data.kpis.openValue)} hint="Nouveau / Qualifié / Proposé" icon="🧠" />
      <KpiCard title="Win rate" value={pct(data.kpis.winRate)} hint="Gagné / (Gagné + Perdu)" icon="🎯" />
      <KpiCard title="Tâches ouvertes" value={String(data.kpis.openTasks)} hint="Tout ce qui reste à faire" icon="🧾" />
      <KpiCard title="Risque" value={String(data.kpis.overdueTasks)} hint="En retard (action requise)" icon="⚠️" />
    </section>

    <section class="two">
      <div class="panel">
        <div class="panel__head">
          <div>
            <div class="panel__title">Tâches critiques</div>
            <div class="panel__sub">À traiter maintenant</div>
          </div>
          <a class="mini" href="/app/clients">Gérer</a>
        </div>

        <div class="tasks">
          <div class="tasks__col">
            <div class="tasks__h">En retard</div>
            {#if data.taskHighlights?.overdue?.length}
              {#each data.taskHighlights.overdue as t}
                <div class="task task--bad">
                  <div class="task__t">{t.title}</div>
                  <div class="task__m">Due: {t.due_date}</div>
                </div>
              {/each}
            {:else}
              <div class="empty">Rien en retard. Bien joué.</div>
            {/if}
          </div>

          <div class="tasks__col">
            <div class="tasks__h">Aujourd’hui</div>
            {#if data.taskHighlights?.dueToday?.length}
              {#each data.taskHighlights.dueToday as t}
                <div class="task task--warn">
                  <div class="task__t">{t.title}</div>
                  <div class="task__m">Due: {t.due_date}</div>
                </div>
              {/each}
            {:else}
              <div class="empty">Aucune tâche prévue aujourd’hui.</div>
            {/if}
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel__head">
          <div>
            <div class="panel__title">Récents clients</div>
            <div class="panel__sub">Les derniers ajoutés</div>
          </div>
          <a class="mini" href="/app/clients">Voir tout</a>
        </div>

        <div class="recent">
          {#if data.recentClients?.length}
            {#each data.recentClients as c}
              <a class="row" href={`/app/clients?query=${encodeURIComponent(c.company ?? c.name)}`}>
                <div class="row__left">
                  <div class="avatar">{(c.company ?? c.name).slice(0, 1).toUpperCase()}</div>
                  <div>
                    <div class="row__title">{c.company ?? c.name}</div>
                    <div class="row__sub">{c.name}</div>
                  </div>
                </div>
                <div class="row__right">
                  <StatusPill status={c.status} />
                  <div class="val">{money(c.value)}</div>
                </div>
              </a>
            {/each}
          {:else}
            <div class="empty">Aucun client pour le moment. Charge la démo.</div>
          {/if}
        </div>
      </div>
    </section>
  </div>
{/if}

<style>
  .grid{ display:grid; gap: 14px; }

  .hero{
    display:grid;
    grid-template-columns: 1.2fr .8fr;
    gap: 14px;
    padding: 16px;
    border-radius: 22px;
    background: rgba(255,255,255,.70);
    border: 1px solid rgba(15,23,42,.08);
    box-shadow: 0 22px 80px rgba(15,23,42,.10);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .badge{
    display:inline-flex;
    align-items:center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 999px;
    background: rgba(93,124,255,.10);
    border: 1px solid rgba(93,124,255,.18);
    font-weight: 900;
    font-size: 12px;
    opacity:.9;
  }

  .h1{
    margin: 10px 0 4px;
    font-size: 34px;
    letter-spacing:-0.03em;
    font-weight: 1000;
  }
  .p{
    margin: 0;
    opacity:.70;
    line-height: 1.45;
    max-width: 46ch;
  }

  .quick{ display:flex; gap: 10px; margin-top: 14px; flex-wrap:wrap; }
  .btn{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    text-decoration:none;
    padding: 10px 12px;
    border-radius: 14px;
    font-weight: 1000;
    background: rgba(93,124,255,.14);
    border: 1px solid rgba(93,124,255,.22);
    color: rgba(37,99,235,.95);
    transition: transform .15s cubic-bezier(.2,.8,.2,1), background .2s cubic-bezier(.2,.8,.2,1);
  }
  .btn:hover{ transform: translateY(-1px); background: rgba(93,124,255,.18); }
  .btn:active{ transform: translateY(0) scale(.99); }
  .btn--ghost{
    background: rgba(15,23,42,.06);
    border-color: rgba(15,23,42,.08);
    color: rgba(15,23,42,.86);
  }
  .btn--ghost:hover{ background: rgba(15,23,42,.09); }

  .pipe{
    height: 100%;
    border-radius: 18px;
    border: 1px solid rgba(15,23,42,.08);
    background: rgba(255,255,255,.66);
    padding: 14px;
  }
  .pipe__title{ font-weight: 1000; letter-spacing:-0.01em; }
  .pipe__list{ display:grid; gap: 10px; margin-top: 12px; }
  .pipe__row{
    display:flex; align-items:center; justify-content:space-between;
    padding: 10px;
    border-radius: 14px;
    background: rgba(15,23,42,.04);
    border: 1px solid rgba(15,23,42,.06);
  }
  .pipe__count{ font-weight: 1000; opacity:.85; }

  .kpis{
    display:grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
  }

  .two{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  .panel{
    border-radius: 22px;
    border: 1px solid rgba(15,23,42,.08);
    background: rgba(255,255,255,.72);
    box-shadow: 0 18px 60px rgba(15,23,42,.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 14px;
  }
  .panel__head{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap: 10px;
    margin-bottom: 10px;
  }
  .panel__title{ font-weight: 1000; letter-spacing:-0.01em; }
  .panel__sub{ font-size: 12px; opacity:.65; margin-top: 2px; }
  .mini{
    text-decoration:none;
    font-weight: 1000;
    font-size: 12px;
    padding: 8px 10px;
    border-radius: 999px;
    background: rgba(15,23,42,.06);
    border: 1px solid rgba(15,23,42,.08);
  }
  .mini:hover{ background: rgba(15,23,42,.09); }

  .tasks{ display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .tasks__h{ font-weight: 1000; font-size: 12px; opacity:.7; margin: 6px 4px; }
  .task{
    padding: 10px 12px;
    border-radius: 16px;
    border: 1px solid rgba(15,23,42,.08);
    background: rgba(15,23,42,.04);
  }
  .task--bad{ background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.16); }
  .task--warn{ background: rgba(245,158,11,.10); border-color: rgba(245,158,11,.18); }
  .task__t{ font-weight: 1000; letter-spacing:-0.01em; }
  .task__m{ font-size: 12px; opacity:.7; margin-top: 4px; }

  .recent{ display:grid; gap: 10px; }
  .row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap: 10px;
    padding: 10px;
    border-radius: 18px;
    text-decoration:none;
    background: rgba(15,23,42,.04);
    border: 1px solid rgba(15,23,42,.06);
    transition: transform .15s cubic-bezier(.2,.8,.2,1), background .2s cubic-bezier(.2,.8,.2,1);
  }
  .row:hover{ transform: translateY(-1px); background: rgba(15,23,42,.06); }
  .row:active{ transform: translateY(0) scale(.99); }

  .row__left{ display:flex; align-items:center; gap: 10px; min-width: 0; }
  .avatar{
    width: 38px; height: 38px;
    border-radius: 16px;
    display:grid; place-items:center;
    background: rgba(93,124,255,.12);
    border: 1px solid rgba(93,124,255,.18);
    font-weight: 1000;
  }
  .row__title{ font-weight: 1000; letter-spacing:-0.01em; white-space: nowrap; overflow:hidden; text-overflow: ellipsis; max-width: 24ch; }
  .row__sub{ font-size: 12px; opacity:.7; margin-top: 2px; white-space: nowrap; overflow:hidden; text-overflow: ellipsis; max-width: 28ch; }

  .row__right{ display:flex; align-items:center; gap: 10px; }
  .val{ font-weight: 1000; opacity:.85; }

  .empty{
    padding: 12px;
    border-radius: 16px;
    border: 1px dashed rgba(15,23,42,.18);
    background: rgba(15,23,42,.03);
    font-size: 13px;
    opacity:.75;
  }

  .err{
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(239,68,68,.20);
    background: rgba(239,68,68,.08);
  }
  .err__title{ font-weight: 1000; }
  .err__text{ opacity:.85; margin-top: 6px; }

  .loading{ opacity:.7; padding: 10px; }

  @media (max-width: 1200px){
    .kpis{ grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }
  @media (max-width: 980px){
    .hero{ grid-template-columns: 1fr; }
    .two{ grid-template-columns: 1fr; }
    .tasks{ grid-template-columns: 1fr; }
  }
</style>
