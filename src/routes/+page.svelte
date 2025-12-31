<script lang="ts">
  import { navigating } from '$app/state';

  type Status = 'Nouveau' | 'Qualifié' | 'Proposé' | 'Gagné' | 'Perdu';
  type Tot = { status: Status; total: number; count: number };
  type Deal = {
    id: string;
    name: string;
    company: string | null;
    status: Status;
    value: number;
    created_at: string;
  };

  type Data = {
    statuses: readonly Status[];
    totals: Tot[];
    pipelineTotal: number;
    wonTotal: number;
    clientsCount: number;
    top5: Deal[];
    loadError: string | null;
  };

  let { data } = $props<{ data: Data }>();

  const isLoading = $derived(() => Boolean(navigating));
  const maxTotal = $derived(() => Math.max(1, ...data.totals.map((t) => t.total || 0)));

  const money = (n: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n ?? 0);

  const pct = (part: number, total: number) => {
    if (!total) return '0%';
    return `${Math.round((part / total) * 100)}%`;
  };

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
</script>

<section class="dash">
  <header class="dash__head">
    <div>
      <h1>Dashboard</h1>
      <p>Vue rapide de ton pipeline : montants, volumes et opportunités.</p>
    </div>

    <div class="headchips">
      <span class="chip">
        <span class="k">Pipeline</span>
        <span class="v">{money(data.pipelineTotal)}</span>
      </span>

      <span class="chip chip--ghost">
        <span class="k">Clients</span>
        <span class="v">{data.clientsCount}</span>
      </span>

      <span class="chip chip--ghost">
        <span class="k">Gagné</span>
        <span class="v">{money(data.wonTotal)}</span>
      </span>

      {#if isLoading}
        <span class="chip chip--loading"><span class="dot"></span> Mise à jour…</span>
      {/if}
    </div>
  </header>

  {#if data.loadError}
    <div class="alert" role="status">⚠️ {data.loadError}</div>
  {/if}

  <div class="kpis">
    <article class="kpi">
      <div class="kpi__top">
        <div class="kpi__t">Total pipeline</div>
        <div class="kpi__badge">Ouvert</div>
      </div>
      <div class="kpi__v">{money(data.pipelineTotal)}</div>
      <div class="kpi__sub">Somme des statuts hors Gagné/Perdu.</div>
    </article>

    <article class="kpi kpi--good">
      <div class="kpi__top">
        <div class="kpi__t">Gagné</div>
        <div class="kpi__badge">Revenue</div>
      </div>
      <div class="kpi__v">{money(data.wonTotal)}</div>
      <div class="kpi__sub">Deals conclus avec succès.</div>
    </article>

    <article class="kpi kpi--soft">
      <div class="kpi__top">
        <div class="kpi__t">Taux de gagné</div>
        <div class="kpi__badge">sur ouvert</div>
      </div>
      <div class="kpi__v">{pct(data.wonTotal, data.pipelineTotal)}</div>
      <div class="kpi__sub">Indicateur de conversion.</div>
    </article>
  </div>

  <div class="grid2">
    <!-- Graphe -->
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

      <div class="chart">
        <svg viewBox="0 0 520 220" role="img" aria-label="Graphe pipeline par statut">
          <line x1="30" y1="190" x2="500" y2="190" stroke="rgba(15,23,42,.18)" stroke-width="1" />

          {#each data.totals as t, i (t.status)}
            <g>
              <rect
                x={40 + i * 92}
                y={190 - Math.round((t.total / maxTotal) * 150)}
                width="62"
                height={Math.round((t.total / maxTotal) * 150)}
                rx="14"
                fill={statusColor(t.status)}
                opacity="0.85"
              />
              <text
                x={40 + i * 92 + 31}
                y="210"
                text-anchor="middle"
                font-size="11"
                fill="rgba(15,23,42,.72)"
              >
                {t.status}
              </text>
              <text
                x={40 + i * 92 + 31}
                y={190 - Math.round((t.total / maxTotal) * 150) - 8}
                text-anchor="middle"
                font-size="11"
                fill="rgba(15,23,42,.85)"
              >
                {t.count}
              </text>
            </g>
          {/each}
        </svg>
      </div>
    </article>

    <!-- Top 5 -->
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
              <div class="sk a"></div>
              <div class="sk b"></div>
              <div class="sk c"></div>
            </div>
          {/each}
        </div>
      {:else if data.top5.length === 0}
        <div class="empty">
          <div class="empty__icon">📈</div>
          <h3>Rien à afficher</h3>
          <p>Crée des clients avec une valeur pour voir le top 5.</p>
          <a class="btn" href="/app/clients">Aller aux clients</a>
        </div>
      {:else}
        <div class="list">
          {#each data.top5 as d (d.id)}
            <a class="row" href="/app/clients" title="Gérer dans Clients">
              <div class="left">
                <div class="avatar">{d.name?.slice(0, 1)?.toUpperCase() ?? 'C'}</div>
                <div class="meta">
                  <div class="name">{d.name}</div>
                  <div class="sub">{d.company ?? '—'} • {new Date(d.created_at).toLocaleDateString('fr-CA')}</div>
                </div>
              </div>
              <div class="right">
                <span class="pill" data-s={d.status}>{d.status}</span>
                <span class="val">{money(d.value)}</span>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </article>
  </div>
</section>

<style>
  :global(:root){
    --primary: rgb(93,124,255);
    --ok: rgb(16,185,129);
    --bad: rgb(239,68,68);
    --warn: rgb(245,158,11);
    --info: rgb(59,130,246);
  }

  .dash{ display:grid; gap: 14px; }
  .dash__head{ display:flex; justify-content:space-between; align-items:flex-end; gap:12px; flex-wrap:wrap; padding: 6px 2px; }

  h1{ margin:0; font-size:28px; letter-spacing:-.02em; font-weight:1000; }
  .dash__head p{ margin:6px 0 0; font-size:13px; opacity:.72; }

  .headchips{ display:flex; gap:10px; align-items:center; flex-wrap:wrap; }

  .chip{
    display:inline-flex; gap:10px; align-items:baseline;
    padding:10px 12px; border-radius:999px;
    background: rgba(255,255,255,.72);
    border:1px solid rgba(15,23,42,.08);
    box-shadow: 0 18px 50px rgba(15,23,42,.06);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .chip .k{ font-size:11px; opacity:.65; font-weight:900; letter-spacing:.02em; }
  .chip .v{ font-size:13px; font-weight:1000; letter-spacing:-.01em; }
  .chip--ghost{ background: rgba(15,23,42,.05); box-shadow:none; }

  .chip--loading{ gap:8px; background: rgba(93,124,255,.10); border-color: rgba(93,124,255,.18); color: rgb(41,66,184); font-weight:900; }
  .dot{ width:8px; height:8px; border-radius:999px; background: rgb(93,124,255); box-shadow: 0 0 0 6px rgba(93,124,255,.16); animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse{ 0%,100%{ transform:scale(1); opacity:.9; } 50%{ transform:scale(1.1); opacity:1; } }

  .alert{ font-size:12px; padding:10px 12px; border-radius:14px; background: rgba(185,28,28,.10); color:#b91c1c; border:1px solid rgba(185,28,28,.18); }

  .kpis{ display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap:12px; }
  .kpi{ border-radius:20px; background: rgba(255,255,255,.72); border:1px solid rgba(15,23,42,.08); box-shadow: 0 18px 55px rgba(15,23,42,.06); padding:14px; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
  .kpi__top{ display:flex; justify-content:space-between; gap:10px; align-items:center; }
  .kpi__t{ font-size:12px; font-weight:1000; opacity:.8; }
  .kpi__badge{ font-size:11px; padding:6px 10px; border-radius:999px; background: rgba(15,23,42,.05); border:1px solid rgba(15,23,42,.08); font-weight:900; opacity:.85; }
  .kpi__v{ margin-top:8px; font-size:26px; font-weight:1000; letter-spacing:-.02em; }
  .kpi__sub{ margin-top:6px; font-size:12px; opacity:.7; }
  .kpi--good{ border-color: rgba(16,185,129,.18); box-shadow: 0 18px 55px rgba(16,185,129,.10); }
  .kpi--soft{ border-color: rgba(93,124,255,.18); box-shadow: 0 18px 55px rgba(93,124,255,.10); }

  .grid2{ display:grid; grid-template-columns: 1.2fr .8fr; gap:12px; align-items:start; }

  .panel{ border-radius:20px; background: rgba(255,255,255,.72); border:1px solid rgba(15,23,42,.08); box-shadow: 0 18px 55px rgba(15,23,42,.06); padding:14px; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
  .panel__head{ display:flex; justify-content:space-between; gap:10px; align-items:flex-start; padding-bottom:10px; }
  .panel__eyebrow{ font-size:11px; opacity:.65; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
  .panel h2{ margin:2px 0 0; font-size:18px; letter-spacing:-.02em; font-weight:1000; }

  .mini-skel{ width:110px; height:12px; border-radius:999px; background: rgba(15,23,42,.08); position:relative; overflow:hidden; }
  .mini-skel::before{ content:""; position:absolute; inset:0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent); transform: translateX(-100%); animation: shimmer 1.1s ease-in-out infinite; }
  @keyframes shimmer{ 0%{ transform:translateX(-100%);} 100%{ transform:translateX(100%);} }

  .chart svg{ width:100%; height:auto; display:block; }

  .list{ display:grid; gap:10px; }
  .row{ text-decoration:none; color:inherit; display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px; border-radius:16px; background: rgba(15,23,42,.04); border:1px solid rgba(15,23,42,.06); transition: transform .16s ease, background .2s ease, border-color .2s ease; }
  .row:hover{ transform: translateY(-1px); background: rgba(93,124,255,.08); border-color: rgba(93,124,255,.18); }

  .left{ display:flex; gap:10px; align-items:center; min-width:0; }
  .avatar{ width:34px; height:34px; border-radius:14px; display:grid; place-items:center; font-weight:1000; color:white; background: linear-gradient(135deg, rgba(111,139,255,1), rgba(93,124,255,1)); box-shadow: 0 16px 40px rgba(93,124,255,.22); flex:0 0 auto; }
  .meta{ display:grid; gap:2px; min-width:0; }
  .name{ font-weight:1000; letter-spacing:-.01em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .sub{ font-size:12px; opacity:.7; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

  .right{ display:flex; gap:10px; align-items:center; }
  .val{ font-weight:1000; letter-spacing:-.01em; }

  .pill{ font-size:12px; font-weight:900; padding:7px 10px; border-radius:999px; border:1px solid rgba(15,23,42,.10); background: rgba(15,23,42,.04); white-space:nowrap; }
  .pill[data-s="Gagné"]{ background: rgba(16,185,129,.12); border-color: rgba(16,185,129,.18); color: rgb(4,120,87); }
  .pill[data-s="Perdu"]{ background: rgba(239,68,68,.12); border-color: rgba(239,68,68,.18); color: rgb(185,28,28); }
  .pill[data-s="Qualifié"]{ background: rgba(59,130,246,.12); border-color: rgba(59,130,246,.18); color: rgb(29,78,216); }
  .pill[data-s="Proposé"]{ background: rgba(245,158,11,.14); border-color: rgba(245,158,11,.22); color: rgb(146,64,14); }
  .pill[data-s="Nouveau"]{ background: rgba(99,102,241,.12); border-color: rgba(99,102,241,.18); color: rgb(55,48,163); }

  .empty{ padding:18px; border-radius:18px; background: rgba(15,23,42,.04); border:1px solid rgba(15,23,42,.06); text-align:center; display:grid; gap:8px; }
  .empty__icon{ font-size:28px; }
  .empty h3{ margin:0; font-size:16px; font-weight:1000; }
  .empty p{ margin:0; font-size:12px; opacity:.7; }

  .btn{ justify-self:center; display:inline-flex; align-items:center; justify-content:center; padding:10px 12px; border-radius:14px; border:1px solid rgba(15,23,42,.08); background: rgba(255,255,255,.70); font-weight:1000; text-decoration:none; color:inherit; }

  .row.skeleton{ background: rgba(255,255,255,.55); position:relative; overflow:hidden; }
  .row.skeleton::before{ content:""; position:absolute; inset:0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent); transform: translateX(-100%); animation: shimmer 1.1s ease-in-out infinite; }
  .sk{ height:12px; border-radius:999px; background: rgba(15,23,42,.10); }
  .sk.a{ width:45%; } .sk.b{ width:25%; } .sk.c{ width:20%; }

  @media (max-width: 1000px){
    .kpis{ grid-template-columns: 1fr; }
    .grid2{ grid-template-columns: 1fr; }
  }
</style>
