<script lang="ts">
  export let data: any;

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n ?? 0);

  const pct = (n: number) => `${Math.max(0, Math.min(100, n || 0))}%`;

  const getCount = (s: string) => Number(data.statusCount?.[s] ?? 0);

  const badgeClass = (s: string) => {
    if (s === 'Gagné') return 'b b--win';
    if (s === 'Perdu') return 'b b--lost';
    if (s === 'Proposé') return 'b b--prop';
    if (s === 'Qualifié') return 'b b--qual';
    return 'b b--new';
  };
</script>

<div class="wrap">
  <header class="top">
    <div>
      <h1>Dashboard</h1>
      <p class="sub">Aujourd’hui: <b>{data.today}</b> • Vue globale sur ton pipeline.</p>
    </div>

    <nav class="nav">
      <a class="ghost" href="/app/clients">Clients</a>
      <a class="ghost" href="/app/clients">+ Ajouter</a>

      <form method="POST" action="/app/seed">
  <button class="ghost" type="submit">Charger démo</button>
</form>


      <form method="POST" action="/app/seed">
  <button class="ghost" type="submit">Charger démo</button>
</form>

      <form method="POST" action="/app/logout">
        <button class="danger" type="submit">Logout</button>
      </form>
    </nav>
  </header>

  {#if data.error}
    <div class="alert alert--danger">Erreur: {data.error}</div>
  {/if}

  {#if data.kpis}
    <section class="grid">
      <div class="card kpi">
        <div class="kpi__label">Clients</div>
        <div class="kpi__value">{data.kpis.totalClients}</div>
        <div class="kpi__hint">Total enregistrés</div>
      </div>

      <div class="card kpi">
        <div class="kpi__label">Pipeline (ouvert)</div>
        <div class="kpi__value">{fmtMoney(data.kpis.openValue)}</div>
        <div class="kpi__hint">Hors Gagné / Perdu</div>
      </div>

      <div class="card kpi">
        <div class="kpi__label">Win rate</div>
        <div class="kpi__value">{data.kpis.winRate}%</div>
        <div class="kpi__hint">Gagné / (Gagné + Perdu)</div>
        <div class="bar"><span style={`width:${pct(data.kpis.winRate)}`}></span></div>
      </div>

      <div class="card kpi">
        <div class="kpi__label">Tâches</div>
        <div class="kpi__value">{data.kpis.openTasks}</div>
        <div class="kpi__hint">
          <span class="pill pill--danger">{data.kpis.overdueTasks} en retard</span>
          <span class="pill pill--warn">{data.kpis.dueTodayTasks} aujourd’hui</span>
        </div>
      </div>
    </section>

    <section class="grid2">
      <div class="card">
        <div class="head">
          <h2>Pipeline</h2>
          <a class="ghost" href="/app/clients">Voir tout</a>
        </div>

        <div class="pipeline">
          <div class="pRow">
            <div class="pName">Nouveau</div>
            <div class="pBar"><span style={`width:${pct(getCount('Nouveau') * 8)}`}></span></div>
            <div class="pN">{getCount('Nouveau')}</div>
          </div>

          <div class="pRow">
            <div class="pName">Qualifié</div>
            <div class="pBar"><span style={`width:${pct(getCount('Qualifié') * 8)}`}></span></div>
            <div class="pN">{getCount('Qualifié')}</div>
          </div>

          <div class="pRow">
            <div class="pName">Proposé</div>
            <div class="pBar"><span style={`width:${pct(getCount('Proposé') * 8)}`}></span></div>
            <div class="pN">{getCount('Proposé')}</div>
          </div>

          <div class="pRow">
            <div class="pName">Gagné</div>
            <div class="pBar pBar--win"><span style={`width:${pct(getCount('Gagné') * 10)}`}></span></div>
            <div class="pN">{getCount('Gagné')}</div>
          </div>

          <div class="pRow">
            <div class="pName">Perdu</div>
            <div class="pBar pBar--lost"><span style={`width:${pct(getCount('Perdu') * 10)}`}></span></div>
            <div class="pN">{getCount('Perdu')}</div>
          </div>
        </div>

        <div class="split">
          <div>
            <div class="mini">Valeur totale</div>
            <div class="big">{fmtMoney(data.kpis.totalValue)}</div>
          </div>
          <div>
            <div class="mini">Gagné</div>
            <div class="big">{fmtMoney(data.kpis.wonValue)}</div>
          </div>
          <div>
            <div class="mini">Perdu</div>
            <div class="big">{fmtMoney(data.kpis.lostValue)}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="head">
          <h2>Alertes & Next steps</h2>
          <span class="hint">Focus sur ce qui brûle</span>
        </div>

        <div class="alerts">
          <div class="aBlock">
            <div class="aTitle">En retard</div>
            {#if data.taskHighlights.overdue.length === 0}
              <div class="aEmpty">Rien en retard. Bien.</div>
            {:else}
              {#each data.taskHighlights.overdue as t (t.id)}
                <div class="aItem">
                  <div class="aMain">{t.title}</div>
                  <div class="aMeta">Échéance: {t.due_date}</div>
                </div>
              {/each}
            {/if}
          </div>

          <div class="aBlock">
            <div class="aTitle">Aujourd’hui</div>
            {#if data.taskHighlights.dueToday.length === 0}
              <div class="aEmpty">Aucune tâche pour aujourd’hui.</div>
            {:else}
              {#each data.taskHighlights.dueToday as t (t.id)}
                <div class="aItem">
                  <div class="aMain">{t.title}</div>
                  <div class="aMeta">Échéance: {t.due_date}</div>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      </div>

      <div class="card" style="grid-column: 1 / -1;">
        <div class="head">
          <h2>Derniers clients</h2>
          <a class="ghost" href="/app/clients">Ouvrir la liste</a>
        </div>

        {#if data.recentClients.length === 0}
          <div class="empty">Ajoute ton premier prospect pour démarrer le pipeline.</div>
        {:else}
          <div class="recent">
            {#each data.recentClients as c (c.id)}
              <a class="rItem" href={`/app/clients/${c.id}`}>
                <div class="rTop">
                  <div class="rName">{c.name}</div>
                  <span class={badgeClass(c.status)}>{c.status}</span>
                </div>
                <div class="rSub">
                  <span>{c.company ?? '—'}</span>
                  <span class="dot">•</span>
                  <b>{fmtMoney(Number(c.value) || 0)}</b>
                </div>
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </section>
  {/if}
</div>

<style>
  .wrap { max-width: 1100px; margin: 0 auto; padding: 26px 16px 60px; }
  .top { display:flex; justify-content:space-between; align-items:flex-end; gap:14px; flex-wrap:wrap; }
  h1 { margin:0; font-size: 36px; letter-spacing:-0.02em; }
  .sub { margin: 8px 0 0; opacity:.75; }
  .nav { display:flex; gap:10px; align-items:center; flex-wrap:wrap; }

  .grid { display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 16px; }
  @media (max-width: 980px){ .grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 560px){ .grid { grid-template-columns: 1fr; } }

  .grid2 { display:grid; grid-template-columns: 1.2fr 1fr; gap: 12px; margin-top: 12px; }
  @media (max-width: 980px){ .grid2 { grid-template-columns: 1fr; } }

  .card {
    background: rgba(255,255,255,0.75);
    border: 1px solid rgba(15,23,42,0.08);
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 20px 60px rgba(15,23,42,0.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .kpi__label { font-size: 12px; opacity:.7; font-weight: 800; }
  .kpi__value { font-size: 28px; font-weight: 1000; letter-spacing:-0.02em; margin-top: 8px; }
  .kpi__hint { margin-top: 6px; font-size: 12px; opacity:.75; display:flex; gap:8px; flex-wrap:wrap; align-items:center; }

  .bar { height: 10px; border-radius: 999px; background: rgba(15,23,42,0.06); overflow:hidden; margin-top: 10px; }
  .bar span { display:block; height:100%; background: rgba(93,124,255,0.9); }

  .head { display:flex; justify-content:space-between; align-items:center; gap:10px; margin-bottom: 12px; }
  .hint { font-size: 12px; opacity:.7; font-weight: 700; }

  .pipeline { display:grid; gap: 10px; }
  .pRow { display:grid; grid-template-columns: 90px 1fr 32px; gap:10px; align-items:center; }
  .pName { font-weight: 900; font-size: 13px; opacity:.85; }
  .pN { text-align:right; font-weight: 900; opacity:.85; }
  .pBar { height: 10px; border-radius: 999px; background: rgba(15,23,42,0.06); overflow:hidden; }
  .pBar span { display:block; height:100%; background: rgba(93,124,255,0.9); }
  .pBar--win span { background: rgba(34,197,94,0.9); }
  .pBar--lost span { background: rgba(239,68,68,0.85); }

  .split { display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 14px; }
  .mini { font-size: 12px; opacity:.7; font-weight: 800; }
  .big { margin-top: 6px; font-weight: 1000; }

  .alerts { display:grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  @media (max-width: 560px){ .alerts { grid-template-columns: 1fr; } }
  .aBlock { padding: 12px; border-radius: 16px; background: rgba(15,23,42,0.04); border: 1px solid rgba(15,23,42,0.06); }
  .aTitle { font-weight: 1000; margin-bottom: 8px; }
  .aItem { padding: 10px; border-radius: 14px; background: rgba(255,255,255,0.7); border: 1px solid rgba(15,23,42,0.08); margin-top: 8px; }
  .aMain { font-weight: 900; }
  .aMeta { font-size: 12px; opacity:.7; margin-top: 4px; }
  .aEmpty { opacity:.75; font-size: 13px; padding: 8px 2px; }

  .recent { display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  @media (max-width: 980px){ .recent { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 560px){ .recent { grid-template-columns: 1fr; } }
  .rItem { text-decoration:none; color: inherit; display:block; padding: 12px; border-radius: 16px; background: rgba(255,255,255,0.6); border: 1px solid rgba(15,23,42,0.08); }
  .rItem:hover { background: rgba(255,255,255,0.8); }
  .rTop { display:flex; justify-content:space-between; align-items:center; gap:10px; }
  .rName { font-weight: 1000; letter-spacing:-0.01em; }
  .rSub { margin-top: 6px; opacity:.8; display:flex; gap:8px; align-items:center; }
  .dot { opacity:.5; }

  .primary, .ghost, .danger {
    border:0; cursor:pointer; border-radius: 12px; padding: 11px 14px; font-weight: 900;
    transition: transform .15s ease, filter .2s ease, background .2s ease;
    white-space: nowrap;
  }
  .ghost { background: rgba(15,23,42,0.06); color:#0f172a; text-decoration:none; display:inline-flex; align-items:center; }
  .ghost:hover { background: rgba(15,23,42,0.09); }
  .danger { background: rgba(185, 28, 28, 0.10); color: #b91c1c; }
  .danger:hover { background: rgba(185, 28, 28, 0.14); }
  .primary:active, .ghost:active, .danger:active { transform: translateY(1px) scale(.99); }

  .pill { font-weight: 1000; font-size: 12px; padding: 5px 10px; border-radius: 999px; border: 1px solid rgba(15,23,42,0.10); }
  .pill--danger { background: rgba(239,68,68,0.10); color:#991b1b; }
  .pill--warn { background: rgba(245,158,11,0.12); color:#92400e; }

  .b { font-size: 12px; padding: 6px 10px; border-radius: 999px; font-weight: 1000; border: 1px solid rgba(15,23,42,0.10); }
  .b--new  { background: rgba(93,124,255,0.12); color: #2942b8; }
  .b--qual { background: rgba(16,185,129,0.10); color: #065f46; }
  .b--prop { background: rgba(245,158,11,0.12); color: #92400e; }
  .b--win  { background: rgba(34,197,94,0.12); color: #166534; }
  .b--lost { background: rgba(239,68,68,0.10); color: #991b1b; }

  .alert { margin-top: 12px; padding: 12px 14px; border-radius: 14px; font-weight: 900; font-size: 13px; }
  .alert--danger { background: rgba(185, 28, 28, 0.10); color: #b91c1c; border: 1px solid rgba(185,28,28,0.18); }

  .empty { padding: 14px; opacity:.75; background: rgba(15,23,42,0.04); border-radius: 14px; }
</style>
