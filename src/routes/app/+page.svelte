<script lang="ts">
  // ✅ Cohérent Svelte 5 + SvelteKit : state (pas stores)
  import { navigating } from '$app/state';

  type Status = 'Nouveau' | 'Qualifié' | 'Proposé' | 'Gagné' | 'Perdu';

  type Deal = {
    id: string;
    name: string;
    company: string | null;
    status: Status;
    value: number | null; // ✅ DB peut renvoyer null
    created_at: string;
  };

  type TaskLite = {
    id: string;
    title: string;
    done: boolean;
    due_date: string | null;
    client_id: string;
    created_at: string;
  };

  type PipelineItem = { status: Status; count: number; value: number };

  type KPIs = {
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

  type Data = {
    today: string;
    error: string | null;
    kpis: KPIs | null;
    pipelineByStatus: PipelineItem[];
    topClients: Deal[];
    recentClients: Deal[];
    taskHighlights: {
      overdue: TaskLite[];
      dueToday: TaskLite[];
      noDue: TaskLite[];
    } | null;
  };

  let { data } = $props<{ data: Data }>();

  // ✅ FIX: navigating est un objet, mais navigating.to est null quand idle
  const isLoading = $derived(Boolean(navigating.to));
  const hasData = $derived(Boolean(data?.kpis) && !data?.error);

  const money = (n: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(Number(n) || 0);

  const statusColor = (s: Status) => {
    switch (s) {
      case 'Gagné':
        return 'var(--ok)';
      case 'Perdu':
        return 'var(--bad)';
      case 'Qualifié':
        return 'var(--info)';
      case 'Proposé':
        return 'var(--warn)';
      default:
        return 'var(--primary)';
    }
  };

  // ✅ Svelte 5 runes: expression directe (pas $derived(() => ...))
  const maxV = $derived(Math.max(1, ...((data?.pipelineByStatus ?? []).map((x) => Number(x.value) || 0))));

  const k = $derived(data?.kpis ?? null);

  const pipelineOpen = $derived(k?.openValue ?? 0);
  const totalClients = $derived(k?.totalClients ?? 0);
  const wonValue = $derived(k?.wonValue ?? 0);
  const winRate = $derived(k?.winRate ?? 0);

  const openTasks = $derived(k?.openTasks ?? 0);
  const overdueTasks = $derived(k?.overdueTasks ?? 0);
  const dueTodayTasks = $derived(k?.dueTodayTasks ?? 0);

  const fmtDue = (iso: string | null) => {
    if (!iso) return '—';
    if (iso === data.today) return 'aujourd’hui';
    return iso;
  };
</script>

<section class="dash">
  <!-- Header -->
  <header class="dash__head">
    <div class="head__left">
      <h1>Dashboard</h1>
      <p>Vue rapide : pipeline, statuts, top deals, et tâches à surveiller.</p>
    </div>

    <div class="head__right">
      <span class="chip chip--primary">
        <span class="k">Total pipeline</span>
        <span class="v">{money(pipelineOpen)}</span>
      </span>

      <span class="chip chip--ghost">
        <span class="k">Clients</span>
        <span class="v">{totalClients}</span>
      </span>

      <span class="chip chip--ghost">
        <span class="k">Aujourd’hui</span>
        <span class="v">{data.today}</span>
      </span>

      {#if isLoading}
        <span class="chip chip--loading"><span class="dot"></span> Mise à jour…</span>
      {/if}
    </div>
  </header>

  {#if data.error}
    <div class="alert" role="status">⚠️ {data.error}</div>
  {/if}

  <!-- Sticky toolbar -->
  <div class="toolbar" aria-label="KPI rapide">
    <div class="toolbar__chips">
      <span class="tchip">
        <span class="tk">Pipeline ouvert</span>
        <span class="tv">{money(pipelineOpen)}</span>
      </span>

      <span class="tchip tchip--good">
        <span class="tk">Gagné</span>
        <span class="tv">{money(wonValue)}</span>
      </span>

      <span class="tchip tchip--soft">
        <span class="tk">Win rate</span>
        <span class="tv">{winRate}%</span>
      </span>

      <span class="tchip tchip--warn">
        <span class="tk">À faire</span>
        <span class="tv">{openTasks}</span>
      </span>

      <span class="tchip tchip--bad">
        <span class="tk">En retard</span>
        <span class="tv">{overdueTasks}</span>
      </span>

      <span class="tchip tchip--info">
        <span class="tk">Échéance today</span>
        <span class="tv">{dueTodayTasks}</span>
      </span>
    </div>
  </div>

  <!-- KPI cards -->
  <div class="kpis">
    {#if isLoading}
      {#each Array(3) as _, i (i)}
        <article class="kpi kpi--skel" aria-hidden="true">
          <div class="sk sk1"></div>
          <div class="sk sk2"></div>
          <div class="sk sk3"></div>
        </article>
      {/each}
    {:else}
      <article class="kpi">
        <div class="kpi__top">
          <div class="kpi__t">Total pipeline</div>
          <div class="kpi__badge">Ouvert</div>
        </div>
        <div class="kpi__v">{money(pipelineOpen)}</div>
        <div class="kpi__sub">Opportunités en cours (hors Gagné / Perdu).</div>
      </article>

      <article class="kpi kpi--good">
        <div class="kpi__top">
          <div class="kpi__t">Gagné</div>
          <div class="kpi__badge">Revenue</div>
        </div>
        <div class="kpi__v">{money(wonValue)}</div>
        <div class="kpi__sub">Deals conclus — excellent signal business.</div>
      </article>

      <article class="kpi kpi--soft">
        <div class="kpi__top">
          <div class="kpi__t">Win rate</div>
          <div class="kpi__badge">Décisions</div>
        </div>
        <div class="kpi__v">{winRate}%</div>
        <div class="kpi__sub">Basé sur Gagné vs Perdu.</div>
      </article>
    {/if}
  </div>

  <div class="grid3">
    <!-- Chart -->
    <article class="panel">
      <div class="panel__head">
        <div>
          <div class="panel__eyebrow">Pipeline</div>
          <h2>Par statut</h2>
        </div>

        {#if isLoading}
          <div class="mini-skel" aria-hidden="true"></div>
        {/if}
      </div>

      {#if isLoading}
        <div class="chart-skel" aria-hidden="true">
          {#each Array(5) as _, i (i)}
            <div class="bar-skel"></div>
          {/each}
        </div>
      {:else if !hasData}
        <div class="empty">
          <div class="empty__icon">📊</div>
          <h3>Pas de données</h3>
          <p>Ajoute des clients avec une valeur pour voir le graphe.</p>
          <a class="btn" href="/app/clients">Aller aux clients</a>
        </div>
      {:else}
        <div class="chart">
          <svg viewBox="0 0 520 220" role="img" aria-label="Graphe pipeline par statut">
            <line x1="30" y1="190" x2="500" y2="190" stroke="rgba(15,23,42,.18)" stroke-width="1" />

            {#each data.pipelineByStatus as t, i (t.status)}
              {@const h = Math.round(((Number(t.value) || 0) / maxV) * 150)}
              {@const y = 190 - h}
              {@const x = 40 + i * 92}

              <g>
                <rect x={x} y={y} width="62" height={h} rx="14" fill={statusColor(t.status)} opacity="0.85" />
                <text x={x + 31} y="210" text-anchor="middle" font-size="11" fill="rgba(15,23,42,.72)">
                  {t.status}
                </text>
                <text x={x + 31} y={y - 8} text-anchor="middle" font-size="11" fill="rgba(15,23,42,.85)">
                  {t.count}
                </text>
              </g>
            {/each}
          </svg>

          <div class="legend">
            <div class="legend__hint">
              Le nombre au-dessus = <b>volume</b>. La hauteur = <b>montant</b>.
            </div>
            <div class="legend__row">
              {#each data.pipelineByStatus as t (t.status)}
                <span class="tag" style={`--c:${statusColor(t.status)}`}>
                  <span class="sw"></span> {t.status}: {money(t.value)}
                </span>
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </article>

    <!-- Top 5 deals -->
    <article class="panel">
      <div class="panel__head">
        <div>
          <div class="panel__eyebrow">Opportunités</div>
          <h2>Top 5 deals</h2>
        </div>
      </div>

      {#if isLoading}
        <div class="list">
          {#each Array(5) as _, i (i)}
            <div class="row skeleton" aria-hidden="true">
              <div class="skline a"></div>
              <div class="skline b"></div>
              <div class="skline c"></div>
            </div>
          {/each}
        </div>
      {:else if (data.topClients?.length ?? 0) === 0}
        <div class="empty">
          <div class="empty__icon">📈</div>
          <h3>Rien à afficher</h3>
          <p>Crée des clients avec une valeur pour voir le top 5.</p>
          <a class="btn" href="/app/clients">Aller aux clients</a>
        </div>
      {:else}
        <div class="list">
          {#each data.topClients as d (d.id)}
            <a class="row" href="/app/clients" title="Gérer dans Clients">
              <div class="left">
                <div class="avatar">{d.name?.slice(0, 1)?.toUpperCase() ?? 'C'}</div>
                <div class="meta">
                  <div class="name">{d.name}</div>
                  <div class="sub">
                    {d.company ?? '—'} • {new Date(d.created_at).toLocaleDateString('fr-CA')}
                  </div>
                </div>
              </div>
              <div class="right">
                <span class="pill" data-s={d.status}>{d.status}</span>
                <span class="val">{money(Number(d.value) || 0)}</span>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </article>

    <!-- Tasks highlights -->
    <article class="panel">
      <div class="panel__head">
        <div>
          <div class="panel__eyebrow">Tâches</div>
          <h2>À surveiller</h2>
        </div>
      </div>

      {#if isLoading}
        <div class="miniList" aria-hidden="true">
          {#each Array(6) as _, i (i)}
            <div class="trow skeleton">
              <div class="skline a"></div>
              <div class="skline b"></div>
            </div>
          {/each}
        </div>
      {:else if !data.taskHighlights}
        <div class="empty">
          <div class="empty__icon">✅</div>
          <h3>Aucune tâche</h3>
          <p>Ajoute des tâches sur tes clients pour voir des alertes ici.</p>
          <a class="btn" href="/app/clients">Aller aux clients</a>
        </div>
      {:else}
        <div class="miniList">
          <div class="group">
            <div class="gtitle">En retard <span class="gcount">{data.taskHighlights.overdue.length}</span></div>
            {#if data.taskHighlights.overdue.length === 0}
              <div class="ghostRow">Rien 🚀</div>
            {:else}
              {#each data.taskHighlights.overdue as t (t.id)}
                <div class="trow">
                  <div class="tmain">{t.title}</div>
                  <div class="tmeta">due: {fmtDue(t.due_date)}</div>
                </div>
              {/each}
            {/if}
          </div>

          <div class="group">
            <div class="gtitle">Aujourd’hui <span class="gcount">{data.taskHighlights.dueToday.length}</span></div>
            {#if data.taskHighlights.dueToday.length === 0}
              <div class="ghostRow">Rien</div>
            {:else}
              {#each data.taskHighlights.dueToday as t (t.id)}
                <div class="trow">
                  <div class="tmain">{t.title}</div>
                  <div class="tmeta">today</div>
                </div>
              {/each}
            {/if}
          </div>

          <div class="group">
            <div class="gtitle">Sans échéance <span class="gcount">{data.taskHighlights.noDue.length}</span></div>
            {#if data.taskHighlights.noDue.length === 0}
              <div class="ghostRow">Rien</div>
            {:else}
              {#each data.taskHighlights.noDue as t (t.id)}
                <div class="trow">
                  <div class="tmain">{t.title}</div>
                  <div class="tmeta">—</div>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      {/if}
    </article>
  </div>
</section>



<style>
  /* ✅ CSS inchangé (je garde ton design) */
  :global(:root){
    --primary: rgb(93,124,255);
    --ok: rgb(16,185,129);
    --bad: rgb(239,68,68);
    --warn: rgb(245,158,11);
    --info: rgb(59,130,246);
  }

  .dash{ display:grid; gap: 14px; }

  .dash__head{
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
    gap: 12px;
    flex-wrap: wrap;
    padding: 6px 2px;
  }

  .head__left{ min-width: 240px; }
  h1{ margin:0; font-size: 28px; letter-spacing: -.02em; font-weight: 1000; }
  .dash__head p{ margin:6px 0 0; font-size: 13px; opacity:.72; }

  .head__right{ display:flex; gap: 10px; align-items:center; flex-wrap:wrap; }

  .chip{
    display:inline-flex;
    gap: 10px;
    align-items:baseline;
    padding: 10px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(15,23,42,.08);
    box-shadow: 0 18px 50px rgba(15,23,42,.06);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .chip .k{ font-size: 11px; opacity:.65; font-weight: 900; letter-spacing:.02em; }
  .chip .v{ font-size: 13px; font-weight: 1000; letter-spacing:-.01em; }
  .chip--ghost{ background: rgba(15,23,42,.05); box-shadow:none; }
  .chip--primary{ background: rgba(93,124,255,.10); border-color: rgba(93,124,255,.18); color: rgb(41,66,184); }
  .chip--loading{
    gap: 8px;
    background: rgba(93,124,255,.10);
    border-color: rgba(93,124,255,.18);
    color: rgb(41,66,184);
    font-weight: 900;
  }
  .dot{
    width: 8px; height: 8px; border-radius: 999px;
    background: rgb(93,124,255);
    box-shadow: 0 0 0 6px rgba(93,124,255,.16);
    animation: pulse 1.2s ease-in-out infinite;
  }
  @keyframes pulse{
    0%,100%{ transform: scale(1); opacity: .9; }
    50%{ transform: scale(1.1); opacity: 1; }
  }

  .toolbar{
    position: sticky;
    top: 86px;
    z-index: 4;
    padding: 6px 2px;
  }
  .toolbar__chips{
    display:flex;
    gap: 10px;
    flex-wrap: wrap;
    padding: 10px;
    border-radius: 18px;
    background: rgba(255,255,255,.68);
    border: 1px solid rgba(15,23,42,.08);
    box-shadow: 0 18px 55px rgba(15,23,42,.06);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  .tchip{
    display:inline-flex;
    gap: 10px;
    align-items:baseline;
    padding: 10px 12px;
    border-radius: 999px;
    background: rgba(15,23,42,.05);
    border: 1px solid rgba(15,23,42,.08);
    font-weight: 950;
  }
  .tk{ font-size: 11px; opacity:.7; font-weight: 900; }
  .tv{ font-size: 13px; letter-spacing:-.01em; }
  .tchip--good{ background: rgba(16,185,129,.10); border-color: rgba(16,185,129,.18); color: rgb(4,120,87); }
  .tchip--bad{ background: rgba(239,68,68,.10); border-color: rgba(239,68,68,.18); color: rgb(185,28,28); }
  .tchip--warn{ background: rgba(245,158,11,.12); border-color: rgba(245,158,11,.20); color: rgb(146,64,14); }
  .tchip--info{ background: rgba(59,130,246,.10); border-color: rgba(59,130,246,.18); color: rgb(29,78,216); }
  .tchip--soft{ background: rgba(93,124,255,.10); border-color: rgba(93,124,255,.18); color: rgb(41,66,184); }

  .alert{
    font-size: 12px;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(185,28,28,.10);
    color: #b91c1c;
    border: 1px solid rgba(185,28,28,.18);
  }

  .kpis{
    display:grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .kpi{
    border-radius: 20px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(15,23,42,.08);
    box-shadow: 0 18px 55px rgba(15,23,42,.06);
    padding: 14px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .kpi__top{ display:flex; justify-content:space-between; gap: 10px; align-items:center; }
  .kpi__t{ font-size: 12px; font-weight: 1000; opacity:.8; }
  .kpi__badge{
    font-size: 11px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(15,23,42,.05);
    border: 1px solid rgba(15,23,42,.08);
    font-weight: 900;
    opacity:.85;
  }
  .kpi__v{ margin-top: 8px; font-size: 26px; font-weight: 1000; letter-spacing: -.02em; }
  .kpi__sub{ margin-top: 6px; font-size: 12px; opacity:.7; }

  .kpi--good{ border-color: rgba(16,185,129,.18); box-shadow: 0 18px 55px rgba(16,185,129,.10); }
  .kpi--soft{ border-color: rgba(93,124,255,.18); box-shadow: 0 18px 55px rgba(93,124,255,.10); }

  .kpi--skel{ overflow:hidden; position: relative; }
  .kpi--skel::before{
    content:"";
    position:absolute; inset:0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent);
    transform: translateX(-100%);
    animation: shimmer 1.1s ease-in-out infinite;
  }
  .sk{ height: 12px; border-radius: 999px; background: rgba(15,23,42,.10); }
  .sk1{ width: 40%; }
  .sk2{ width: 75%; height: 24px; margin-top: 12px; border-radius: 14px; }
  .sk3{ width: 55%; margin-top: 10px; }

  @keyframes shimmer{ 0%{ transform: translateX(-100%);} 100%{ transform: translateX(100%);} }

  .grid3{
    display:grid;
    grid-template-columns: 1.2fr .85fr .95fr;
    gap: 12px;
    align-items: start;
  }

  .panel{
    border-radius: 20px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(15,23,42,.08);
    box-shadow: 0 18px 55px rgba(15,23,42,.06);
    padding: 14px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .panel__head{
    display:flex;
    justify-content:space-between;
    gap: 10px;
    align-items:flex-start;
    padding-bottom: 10px;
  }
  .panel__eyebrow{
    font-size: 11px;
    opacity:.65;
    font-weight: 900;
    letter-spacing: .08em;
    text-transform: uppercase;
  }
  .panel h2{
    margin: 2px 0 0;
    font-size: 18px;
    letter-spacing: -.02em;
    font-weight: 1000;
  }

  .mini-skel{
    width: 110px; height: 12px; border-radius: 999px;
    background: rgba(15,23,42,.08);
    position: relative;
    overflow:hidden;
  }
  .mini-skel::before{
    content:"";
    position:absolute; inset:0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent);
    transform: translateX(-100%);
    animation: shimmer 1.1s ease-in-out infinite;
  }

  .chart svg{ width: 100%; height: auto; display:block; }
  .legend{ margin-top: 8px; display:grid; gap: 10px; }
  .legend__hint{ font-size: 12px; opacity:.7; }
  .legend__row{ display:flex; flex-wrap: wrap; gap: 8px; }
  .tag{
    display:inline-flex; align-items:center; gap: 8px;
    padding: 8px 10px;
    border-radius: 999px;
    background: rgba(15,23,42,.05);
    border: 1px solid rgba(15,23,42,.08);
    font-size: 12px;
    font-weight: 900;
    opacity:.9;
  }
  .sw{ width: 10px; height: 10px; border-radius: 999px; background: var(--c); }

  .chart-skel{
    display:flex; gap: 10px; align-items:flex-end;
    height: 180px;
    padding: 10px 6px;
  }
  .bar-skel{
    flex: 1;
    height: 40%;
    border-radius: 16px;
    background: rgba(15,23,42,.08);
    position: relative;
    overflow:hidden;
  }
  .bar-skel::before{
    content:"";
    position:absolute; inset:0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent);
    transform: translateX(-100%);
    animation: shimmer 1.1s ease-in-out infinite;
  }

  .list{ display:grid; gap: 10px; }
  .row{
    text-decoration:none;
    color: inherit;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap: 10px;
    padding: 12px;
    border-radius: 16px;
    background: rgba(15,23,42,.04);
    border: 1px solid rgba(15,23,42,.06);
    transition: transform .16s ease, background .2s ease, border-color .2s ease;
  }
  .row:hover{
    transform: translateY(-1px);
    background: rgba(93,124,255,.08);
    border-color: rgba(93,124,255,.18);
  }

  .left{ display:flex; gap: 10px; align-items:center; min-width: 0; }
  .avatar{
    width: 34px; height: 34px; border-radius: 14px;
    display:grid; place-items:center;
    font-weight: 1000; color: white;
    background: linear-gradient(135deg, rgba(111,139,255,1), rgba(93,124,255,1));
    box-shadow: 0 16px 40px rgba(93,124,255,.22);
    flex: 0 0 auto;
  }
  .meta{ display:grid; gap: 2px; min-width:0; }
  .name{ font-weight: 1000; letter-spacing:-.01em; white-space:nowrap; overflow:hidden; text-overflow: ellipsis; }
  .sub{ font-size: 12px; opacity:.7; white-space:nowrap; overflow:hidden; text-overflow: ellipsis; }

  .right{ display:flex; gap: 10px; align-items:center; }
  .val{ font-weight: 1000; letter-spacing:-.01em; }

  .pill{
    font-size: 12px;
    font-weight: 900;
    padding: 7px 10px;
    border-radius: 999px;
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(15,23,42,.04);
    white-space: nowrap;
  }
  .pill[data-s="Gagné"]{ background: rgba(16,185,129,.12); border-color: rgba(16,185,129,.18); color: rgb(4,120,87); }
  .pill[data-s="Perdu"]{ background: rgba(239,68,68,.12); border-color: rgba(239,68,68,.18); color: rgb(185,28,28); }
  .pill[data-s="Qualifié"]{ background: rgba(59,130,246,.12); border-color: rgba(59,130,246,.18); color: rgb(29,78,216); }
  .pill[data-s="Proposé"]{ background: rgba(245,158,11,.14); border-color: rgba(245,158,11,.22); color: rgb(146,64,14); }
  .pill[data-s="Nouveau"]{ background: rgba(99,102,241,.12); border-color: rgba(99,102,241,.18); color: rgb(55,48,163); }

  .miniList{ display:grid; gap: 12px; }
  .group{ display:grid; gap: 8px; }
  .gtitle{
    display:flex; justify-content:space-between; align-items:center;
    font-weight: 1000; font-size: 12px; opacity:.85;
    letter-spacing: -.01em;
  }
  .gcount{
    font-size: 11px;
    padding: 5px 9px;
    border-radius: 999px;
    background: rgba(15,23,42,.05);
    border: 1px solid rgba(15,23,42,.08);
  }
  .trow{
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(15,23,42,.04);
    border: 1px solid rgba(15,23,42,.06);
    display:flex;
    justify-content:space-between;
    gap: 10px;
    align-items:center;
  }
  .tmain{
    font-weight: 950;
    font-size: 13px;
    white-space: nowrap;
    overflow:hidden;
    text-overflow: ellipsis;
    max-width: 70%;
  }
  .tmeta{ font-size: 12px; opacity:.7; white-space: nowrap; }
  .ghostRow{
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(255,255,255,.55);
    border: 1px dashed rgba(15,23,42,.12);
    font-size: 12px;
    opacity:.75;
  }

  .empty{
    padding: 18px;
    border-radius: 18px;
    background: rgba(15,23,42,.04);
    border: 1px solid rgba(15,23,42,.06);
    text-align:center;
    display:grid;
    gap: 8px;
  }
  .empty__icon{ font-size: 28px; }
  .empty h3{ margin: 0; font-size: 16px; font-weight: 1000; }
  .empty p{ margin: 0; font-size: 12px; opacity:.7; }

  .btn{
    justify-self: center;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid rgba(15,23,42,.08);
    background: rgba(255,255,255,.70);
    font-weight: 1000;
    text-decoration:none;
    color: inherit;
  }

  .row.skeleton, .trow.skeleton{ background: rgba(255,255,255,.55); position:relative; overflow:hidden; }
  .row.skeleton::before, .trow.skeleton::before{
    content:"";
    position:absolute; inset:0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent);
    transform: translateX(-100%);
    animation: shimmer 1.1s ease-in-out infinite;
  }
  .skline{ height: 12px; border-radius: 999px; background: rgba(15,23,42,.10); }
  .skline.a{ width: 55%; }
  .skline.b{ width: 30%; }
  .skline.c{ width: 22%; }

  @media (max-width: 1100px){
    .kpis{ grid-template-columns: 1fr; }
    .grid3{ grid-template-columns: 1fr; }
    .toolbar{ position: relative; top: 0; }
  }

  @media (prefers-reduced-motion: reduce){
    .dot{ animation: none !important; }
    .kpi--skel::before, .mini-skel::before, .row.skeleton::before, .trow.skeleton::before, .bar-skel::before{
      animation: none !important;
    }
  }
</style>
