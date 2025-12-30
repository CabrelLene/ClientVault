<script lang="ts">
  export let data: {
    q: string;
    status: string;
    statuses: readonly string[];
    clients: Array<{
      id: string;
      name: string;
      company: string | null;
      status: string;
      value: number;
      created_at: string;
    }>;
    loadError: string | null;
  };

  export let form: { error?: string } | undefined;

  let creating = false;
  let editingId: string | null = null;

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n ?? 0);

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
      <h1>Clients</h1>
      <p class="sub">Pipeline de prospects & mandats — simple, rapide, propre.</p>
    </div>

    <div class="top__actions">
  <a class="ghost" href="/app">Dashboard</a>

  <!-- Export respecte les filtres actuels -->
  <a class="ghost" href={`/app/clients/export?q=${encodeURIComponent(data.q)}&status=${encodeURIComponent(data.status)}`}>
    Export CSV
  </a>

  <button class="primary" type="button" on:click={() => (creating = !creating)}>
    {creating ? 'Fermer' : '+ Ajouter'}
  </button>
</div>

  </header>

  {#if data.loadError}
    <div class="alert alert--danger">Erreur chargement: {data.loadError}</div>
  {/if}

  {#if form?.error}
    <div class="alert alert--danger">{form.error}</div>
  {/if}

  <section class="card">
    <form class="filters" method="GET">
      <input
        class="input"
        type="search"
        name="q"
        placeholder="Rechercher (nom ou entreprise)…"
        value={data.q}
      />

      <select class="input" name="status" value={data.status}>
        <option value="all">Tous les statuts</option>
        {#each data.statuses as s}
          <option value={s}>{s}</option>
        {/each}
      </select>

      <button class="ghost" type="submit">Filtrer</button>
      <a class="ghost" href="/app/clients">Reset</a>
    </form>
  </section>

  {#if creating}
    <section class="card">
      <h2 class="h2">Nouveau client</h2>

      <form class="grid" method="POST" action="?/create">
        <label class="field">
          <span>Nom</span>
          <input class="input" name="name" placeholder="Ex: Jean Tremblay" required />
        </label>

        <label class="field">
          <span>Entreprise</span>
          <input class="input" name="company" placeholder="Ex: Logia Inc." />
        </label>

        <label class="field">
          <span>Statut</span>
          <select class="input" name="status">
            {#each data.statuses as s}
              <option value={s} selected={s === 'Nouveau'}>{s}</option>
            {/each}
          </select>
        </label>

        <label class="field">
          <span>Valeur (CAD)</span>
          <input class="input" name="value" inputmode="decimal" placeholder="Ex: 2500" />
        </label>

        <div class="row">
          <button class="primary" type="submit">Créer</button>
          <button class="ghost" type="button" on:click={() => (creating = false)}>Annuler</button>
        </div>
      </form>
    </section>
  {/if}

  <section class="card">
    <div class="tablehead">
      <div class="kpi">
        <div class="kpi__n">{data.clients.length}</div>
        <div class="kpi__t">éléments</div>
      </div>

      <div class="kpi">
        <div class="kpi__n">
          {fmtMoney(data.clients.reduce((acc, c) => acc + (Number(c.value) || 0), 0))}
        </div>
        <div class="kpi__t">valeur totale</div>
      </div>
    </div>

    {#if data.clients.length === 0}
      <div class="empty">
        <div class="empty__title">Aucun résultat</div>
        <div class="empty__text">Ajoute un prospect, ou enlève les filtres.</div>
      </div>
    {:else}
      <div class="list">
        {#each data.clients as c (c.id)}
          <div class="item">
            {#if editingId === c.id}
              <!-- EDIT MODE -->
              <form class="edit" method="POST" action="?/update">
                <input type="hidden" name="id" value={c.id} />

                <div class="edit__main">
                  <input class="input" name="name" value={c.name} required />
                  <input class="input" name="company" value={c.company ?? ''} placeholder="Entreprise" />
                </div>

                <div class="edit__side">
                  <select class="input" name="status" value={c.status}>
                    {#each data.statuses as s}
                      <option value={s}>{s}</option>
                    {/each}
                  </select>

                  <input class="input" name="value" inputmode="decimal" value={String(c.value ?? 0)} />

                  <div class="row">
                    <button class="primary" type="submit">Sauver</button>
                    <button class="ghost" type="button" on:click={() => (editingId = null)}>
                      Annuler
                    </button>
                  </div>
                </div>
              </form>
            {:else}
              <!-- VIEW MODE -->
              <div class="meta">
                <div class="meta__title">
                  <div class="name">
                    <a class="link" href={`/app/clients/${c.id}`}>{c.name}</a>
                  </div>
                  <span class={badgeClass(c.status)}>{c.status}</span>
                </div>

                <div class="meta__sub">
                  <span class="company">{c.company ?? '—'}</span>
                  <span class="dot">•</span>
                  <span class="value">{fmtMoney(Number(c.value) || 0)}</span>
                </div>
              </div>

              <div class="actions">
                <button class="ghost" type="button" on:click={() => (editingId = c.id)}>
                  Éditer
                </button>

                <form method="POST" action="?/remove" on:submit|preventDefault={(e) => {
                  if (confirm('Supprimer ce client ?')) (e.currentTarget as HTMLFormElement).submit();
                }}>
                  <input type="hidden" name="id" value={c.id} />
                  <button class="danger" type="submit">Supprimer</button>
                </form>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .wrap { max-width: 1020px; margin: 0 auto; padding: 28px 16px 60px; }

  .top { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; margin-bottom: 18px; }
  h1 { margin:0; font-size: 34px; letter-spacing:-0.02em; }
  .sub { margin:6px 0 0; opacity:.75; }

  .top__actions { display:flex; gap:10px; align-items:center; }

  .card {
    background: rgba(255,255,255,0.75);
    border: 1px solid rgba(15,23,42,0.08);
    border-radius: 18px;
    padding: 16px;
    box-shadow: 0 20px 60px rgba(15,23,42,0.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    margin-top: 12px;
  }

  .filters { display:grid; grid-template-columns: 1.4fr 0.7fr auto auto; gap:10px; align-items:center; }
  @media (max-width: 760px){
    .top { flex-direction: column; align-items: flex-start; }
    .filters { grid-template-columns: 1fr; }
    .top__actions { width: 100%; }
  }

  .h2 { margin: 0 0 12px; font-size: 18px; letter-spacing:-0.01em; }

  .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 760px){ .grid { grid-template-columns: 1fr; } }

  .field span { font-size: 12px; opacity: .75; display:block; margin-bottom: 6px; }

  .input {
    width: 100%;
    border: 1px solid rgba(15,23,42,0.10);
    background: #f3f4f6;
    padding: 12px 12px;
    border-radius: 12px;
    outline: none;
    font-size: 14px;
  }
  .input:focus {
    border-color: rgba(93,124,255,0.55);
    box-shadow: 0 0 0 4px rgba(93,124,255,0.14);
    background: #f7f8ff;
  }

  .row { display:flex; gap:10px; align-items:center; }

  .primary, .ghost, .danger {
    border:0; cursor:pointer; border-radius: 12px; padding: 11px 14px; font-weight: 800;
    transition: transform .15s ease, filter .2s ease, background .2s ease;
  }
  .primary { background:#5d7cff; color:#fff; box-shadow:0 14px 30px rgba(93,124,255,.25); }
  .primary:hover { filter:brightness(1.02); }
  .ghost { background: rgba(15,23,42,0.06); color: #0f172a; }
  .ghost:hover { background: rgba(15,23,42,0.09); }
  .danger { background: rgba(185, 28, 28, 0.10); color: #b91c1c; }
  .danger:hover { background: rgba(185, 28, 28, 0.14); }
  .primary:active, .ghost:active, .danger:active { transform: translateY(1px) scale(.99); }

  .alert { margin-top: 12px; padding: 12px 14px; border-radius: 14px; font-weight: 700; font-size: 13px; }
  .alert--danger { background: rgba(185, 28, 28, 0.10); color: #b91c1c; border: 1px solid rgba(185,28,28,0.18); }

  .tablehead { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom: 12px; }
  .kpi { display:flex; gap:10px; align-items:baseline; }
  .kpi__n { font-weight: 900; font-size: 18px; }
  .kpi__t { opacity:.7; font-size: 12px; }

  .list { display:grid; gap: 10px; }
  .item {
    display:flex; justify-content:space-between; align-items:center; gap:12px;
    padding: 12px; border: 1px solid rgba(15,23,42,0.08); border-radius: 16px; background: rgba(255,255,255,0.6);
  }

  .meta__title { display:flex; align-items:center; gap:10px; }
  .name { font-weight: 900; letter-spacing: -0.01em; }

  .link { color: inherit; text-decoration: none; }
  .link:hover { text-decoration: underline; }

  .meta__sub { display:flex; gap:8px; align-items:center; opacity:.75; font-size: 13px; margin-top: 3px; }
  .dot { opacity: .5; }

  .actions { display:flex; gap:10px; align-items:center; }

  .b {
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 999px;
    font-weight: 900;
    border: 1px solid rgba(15,23,42,0.10);
  }
  .b--new  { background: rgba(93,124,255,0.12); color: #2942b8; }
  .b--qual { background: rgba(16,185,129,0.10); color: #065f46; }
  .b--prop { background: rgba(245,158,11,0.12); color: #92400e; }
  .b--win  { background: rgba(34,197,94,0.12); color: #166534; }
  .b--lost { background: rgba(239,68,68,0.10); color: #991b1b; }

  .edit { width:100%; display:grid; grid-template-columns: 1.2fr 1fr; gap:12px; }
  .edit__main { display:grid; gap:10px; }
  .edit__side { display:grid; gap:10px; }
  @media (max-width: 860px) {
    .item { align-items: stretch; }
    .actions { flex-direction: column; align-items: stretch; }
    .edit { grid-template-columns: 1fr; }
  }

  .empty { padding: 26px 10px; text-align: center; }
  .empty__title { font-weight: 900; font-size: 16px; }
  .empty__text { opacity: .75; margin-top: 6px; }
</style>
