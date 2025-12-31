<script lang="ts">
  import { navigating } from '$app/stores';
  import { browser } from '$app/environment';

  type Status = 'Nouveau' | 'Qualifié' | 'Proposé' | 'Gagné' | 'Perdu';

  type Client = {
    id: string;
    name: string;
    company: string | null;
    status: Status;
    value: number | null;
    created_at: string;
  };

  type Data = {
    q: string;
    status: string; // 'all' ou Status
    statuses: readonly Status[];
    clients: Client[];
    loadError: string | null;
  };

  let { data } = $props<{ data: Data }>();

  // ✅ vrai loading
  const isLoading = $derived($navigating !== null);

  // Toolbar state
  let qVal = $state('');
  let statusVal = $state<'all' | Status>('all');
  let filterForm: HTMLFormElement | null = $state(null);

  $effect(() => {
    qVal = (data?.q ?? '').trim();
    const s = (data?.status ?? 'all').trim() as any;
    statusVal = (s === 'all' ? 'all' : (s as Status)) as any;
  });

  const clients = $derived((data?.clients ?? []) as Client[]);

  const totalValue = $derived.by(() => clients.reduce((sum, c) => sum + (Number(c.value) || 0), 0));

  const pipelineOpen = $derived.by(() =>
    clients.reduce((sum, c) => {
      const v = Number(c.value) || 0;
      if (c.status === 'Gagné' || c.status === 'Perdu') return sum;
      return sum + v;
    }, 0)
  );

  const wonValue = $derived.by(() =>
    clients.reduce((sum, c) => (c.status === 'Gagné' ? sum + (Number(c.value) || 0) : sum), 0)
  );

  const lostValue = $derived.by(() =>
    clients.reduce((sum, c) => (c.status === 'Perdu' ? sum + (Number(c.value) || 0) : sum), 0)
  );

  const countByStatus = $derived.by(() =>
    clients.reduce((m, c) => {
      m[c.status] = (m[c.status] ?? 0) + 1;
      return m;
    }, {} as Record<Status, number>)
  );

  const money = (n: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(Number(n) || 0);

  const statusMeta = (s: Status) => {
    switch (s) {
      case 'Gagné':
        return { bg: 'rgba(16,185,129,.12)', bd: 'rgba(16,185,129,.18)', tx: 'rgb(4,120,87)' };
      case 'Perdu':
        return { bg: 'rgba(239,68,68,.12)', bd: 'rgba(239,68,68,.18)', tx: 'rgb(185,28,28)' };
      case 'Qualifié':
        return { bg: 'rgba(59,130,246,.12)', bd: 'rgba(59,130,246,.18)', tx: 'rgb(29,78,216)' };
      case 'Proposé':
        return { bg: 'rgba(245,158,11,.14)', bd: 'rgba(245,158,11,.22)', tx: 'rgb(146,64,14)' };
      default:
        return { bg: 'rgba(99,102,241,.12)', bd: 'rgba(99,102,241,.18)', tx: 'rgb(55,48,163)' };
    }
  };

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('fr-CA', { year: 'numeric', month: 'short', day: '2-digit' });
    } catch {
      return iso;
    }
  };

  // Tri UI
  type SortBy = 'date' | 'value' | 'status';
  type SortDir = 'asc' | 'desc';

  let sortBy = $state<SortBy>('date');
  let sortDir = $state<SortDir>('desc');

  const statusRank: Record<Status, number> = {
    Nouveau: 0,
    Qualifié: 1,
    Proposé: 2,
    Gagné: 3,
    Perdu: 4
  };

  const viewClients = $derived.by(() => {
    const arr = [...clients];

    arr.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'value') {
        cmp = (Number(a.value) || 0) - (Number(b.value) || 0);
      } else if (sortBy === 'status') {
        cmp = (statusRank[a.status] ?? 0) - (statusRank[b.status] ?? 0);
      } else {
        const ta = Date.parse(a.created_at) || 0;
        const tb = Date.parse(b.created_at) || 0;
        cmp = ta - tb;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return arr;
  });

  function toggleDir() {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  }

  function submitFilters() {
    filterForm?.requestSubmit();
  }

  const clientHref = (id: string) => `/app/clients/${id}`;

  // Modal
  type ModalMode = 'create' | 'edit';
  let modalOpen = $state(false);
  let mode = $state<ModalMode>('create');

  let idVal = $state('');
  let nameVal = $state('');
  let companyVal = $state('');
  let statusEditVal = $state<Status>('Nouveau');
  let valueVal = $state('');

  const modalTitle = $derived(mode === 'edit' ? 'Modifier le client' : 'Ajouter un client');
  const modalAction = $derived(mode === 'edit' ? '?/update' : '?/create');
  const modalCta = $derived(mode === 'edit' ? 'Enregistrer' : 'Créer');

  function openCreate() {
    mode = 'create';
    idVal = '';
    nameVal = '';
    companyVal = '';
    statusEditVal = 'Nouveau';
    valueVal = '';
    modalOpen = true;
  }

  function openEdit(c: Client) {
    mode = 'edit';
    idVal = c.id;
    nameVal = c.name ?? '';
    companyVal = c.company ?? '';
    statusEditVal = c.status;
    valueVal = c.value == null ? '' : String(Number(c.value) || 0);
    modalOpen = true;
  }

  function closeModal() {
    modalOpen = false;
  }

  $effect(() => {
    if (!browser) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalOpen) closeModal();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[name="q"]')?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  function submitQuickStatus(e: Event) {
    const sel = e.currentTarget as HTMLSelectElement;
    sel.form?.requestSubmit();
  }
</script>

<section class="page">
  <header class="head">
    <div class="hleft">
      <div class="titleRow">
        <div class="badge">CRM</div>
        <h1>Clients</h1>
      </div>
      <p>Recherche, filtre, modifie — et garde ton pipeline sous contrôle.</p>
    </div>

    <div class="hright">
      <span class="chip chip--primary">
        <span class="k">Pipeline ouvert</span>
        <span class="v">{money(pipelineOpen)}</span>
      </span>

      <span class="chip chip--ghost">
        <span class="k">Clients</span>
        <span class="v">{clients.length}</span>
      </span>

      {#if isLoading}
        <span class="chip chip--loading">
          <span class="dot"></span> Mise à jour…
        </span>
      {/if}
    </div>
  </header>

  {#if data.loadError}
    <div class="alert" role="status">⚠️ {data.loadError}</div>
  {/if}

  <div class="toolbar" aria-label="Barre outils clients">
    <div class="toolbar__inner">
      <form class="filters" method="GET" bind:this={filterForm}>
        <div class="search">
          <span class="sicon" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
              <path
                d="M10 18a8 8 0 1 1 0-16a8 8 0 0 1 0 16Zm10 4l-6-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>

          <input
            name="q"
            type="search"
            placeholder="Rechercher (nom, entreprise)…"
            bind:value={qVal}
            autocomplete="off"
          />
          <span class="kbd" aria-hidden="true">Ctrl/⌘ K</span>
        </div>

        <div class="selectWrap">
          <select name="status" bind:value={statusVal} onchange={submitFilters} aria-label="Filtrer par statut">
            <option value="all">Tous statuts</option>
            {#each data.statuses as s (s)}
              <option value={s}>{s}</option>
            {/each}
          </select>
        </div>

        <button class="btn btn--ghost" type="submit">
          <span class="ico">
            <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
              <path
                d="M4 4h16v4H4zM6 12h12v8H6z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          Filtrer
        </button>
      </form>

      <div class="sortRow" aria-label="Tri">
        <div class="sortWrap">
          <span class="sortLabel">Tri</span>
          <select bind:value={sortBy} aria-label="Trier par">
            <option value="date">Date</option>
            <option value="value">Valeur</option>
            <option value="status">Statut</option>
          </select>

          <button class="btn btn--ghost btn--tiny" type="button" onclick={toggleDir} aria-label="Inverser l'ordre">
            <span class="ico">
              <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
                <path
                  d="M7 7l5-5l5 5M12 2v20M17 17l-5 5l-5-5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            {sortDir === 'asc' ? 'Asc' : 'Desc'}
          </button>
        </div>

        <div class="kpiRow" aria-label="Indicateurs rapides">
          <span class="tchip">
            <span class="tk">Ouvert</span>
            <span class="tv">{money(pipelineOpen)}</span>
          </span>
          <span class="tchip tchip--good">
            <span class="tk">Gagné</span>
            <span class="tv">{money(wonValue)}</span>
          </span>
          <span class="tchip tchip--bad">
            <span class="tk">Perdu</span>
            <span class="tv">{money(lostValue)}</span>
          </span>
          <span class="tchip tchip--ghost">
            <span class="tk">Total</span>
            <span class="tv">{money(totalValue)}</span>
          </span>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn--primary" type="button" onclick={openCreate}>
          <span class="ico">
            <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
              <path
                d="M12 5v14M5 12h14"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </span>
          Ajouter
        </button>

        <a class="btn btn--ghost" href="/app/clients/export">
          <span class="ico">
            <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
              <path
                d="M12 3v12m0 0l4-4m-4 4l-4-4M4 21h16"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          Export CSV
        </a>
      </div>
    </div>
  </div>

  {#if isLoading}
    <div class="grid">
      {#each Array(8) as _, i (i)}
        <article class="card card--skel" aria-hidden="true">
          <div class="sk sk1"></div>
          <div class="sk sk2"></div>
          <div class="sk sk3"></div>
          <div class="sk sk4"></div>
        </article>
      {/each}
    </div>
  {:else if clients.length === 0}
    <div class="empty">
      <div class="empty__icon">🗂️</div>
      <h2>Aucun client</h2>
      <p>Commence par créer un client. Ajoute une valeur pour alimenter ton pipeline.</p>
      <button class="btn btn--primary" type="button" onclick={openCreate}>
        <span class="ico">
          <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
            <path
              d="M12 5v14M5 12h14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </span>
        Créer un client
      </button>
    </div>
  {:else}
    <div class="grid">
      {#each viewClients as c (c.id)}
        <article class="card">
          <!-- contenu visuel -->
          <div class="card__content">
            <div class="card__top">
              <div class="who">
                <div class="avatar">{c.name?.slice(0, 1)?.toUpperCase() ?? 'C'}</div>
                <div class="meta">
                  <div class="name" title={c.name}>{c.name}</div>
                  <div class="sub">
                    {c.company ?? '—'} • <span class="date">{fmtDate(c.created_at)}</span>
                  </div>
                </div>
              </div>

              <!-- controls au-dessus du lien -->
              <div class="statusBox controls">
                <span
                  class="pill"
                  style={`background:${statusMeta(c.status).bg};border-color:${statusMeta(c.status).bd};color:${statusMeta(
                    c.status
                  ).tx}`}
                  title="Statut actuel"
                >
                  <span class="dotS" style={`background:${statusMeta(c.status).tx}`}></span>
                  {c.status}
                  <span class="mini">({countByStatus[c.status] ?? 0})</span>
                </span>

                <form method="POST" action="?/quickStatus" class="quick">
                  <input type="hidden" name="id" value={c.id} />
                  <select
                    class="quickSelect"
                    name="status"
                    value={c.status}
                    onchange={(e) => {
                      e.stopPropagation();
                      submitQuickStatus(e);
                    }}
                    aria-label="Modifier le statut"
                  >
                    {#each data.statuses as s (s)}
                      <option value={s}>{s}</option>
                    {/each}
                  </select>
                </form>
              </div>
            </div>

            <div class="value">
              <div class="vk">Valeur</div>
              <div class="vv">{money(Number(c.value) || 0)}</div>
            </div>
          </div>

          <!-- ✅ lien “stretched” au-dessus du contenu (clic carte) -->
          <a class="stretched" href={clientHref(c.id)} aria-label={`Ouvrir ${c.name}`}></a>

          <!-- actions au-dessus du lien -->
          <div class="card__actions controls">
            <button
              class="btn btn--ghost"
              type="button"
              onclick={(e) => {
                e.stopPropagation();
                openEdit(c);
              }}
            >
              <span class="ico">
                <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
                  <path d="M12 20h9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path
                    d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1l1-4L16.5 3.5Z"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              Modifier
            </button>

            <a
              class="btn btn--ghost"
              href={clientHref(c.id)}
              onclick={(e) => e.stopPropagation()}
              title="Ouvrir la fiche"
            >
              <span class="ico">
                <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
                  <path d="M14 3h7v7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path d="M10 14L21 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path
                    d="M21 14v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              Ouvrir
            </a>

            <form
              method="POST"
              action="?/remove"
              class="inline"
              onclick={(e) => e.stopPropagation()}
              onsubmit={(e) => e.stopPropagation()}
            >
              <input type="hidden" name="id" value={c.id} />
              <button class="btn btn--danger" type="submit">
                <span class="ico">
                  <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
                    <path d="M3 6h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                    <path
                      d="M8 6V4h8v2m-1 0v14H9V6"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                Supprimer
              </button>
            </form>
          </div>
        </article>
      {/each}
    </div>
  {/if}

  <div class="modal" data-open={modalOpen ? '1' : '0'} aria-hidden={modalOpen ? 'false' : 'true'}>
    <div class="backdrop" onclick={closeModal} aria-hidden="true"></div>

    <div class="dialog" role="dialog" aria-modal="true" aria-label={modalTitle}>
      <div class="dialog__head">
        <div class="dtxt">
          <div class="eyebrow">ClientVault</div>
          <h3>{modalTitle}</h3>
        </div>
        <button class="x" type="button" onclick={closeModal} aria-label="Fermer">✕</button>
      </div>

      <form class="form" method="POST" action={modalAction}>
        {#if mode === 'edit'}
          <input type="hidden" name="id" value={idVal} />
        {/if}

        <label class="field">
          <span class="lab">Nom *</span>
          <input name="name" required placeholder="Ex: Marc Tremblay" bind:value={nameVal} />
        </label>

        <label class="field">
          <span class="lab">Entreprise</span>
          <input name="company" placeholder="Ex: Logia Inc." bind:value={companyVal} />
        </label>

        <div class="row2">
          <label class="field">
            <span class="lab">Statut</span>
            <select name="status" bind:value={statusEditVal}>
              {#each data.statuses as s (s)}
                <option value={s}>{s}</option>
              {/each}
            </select>
          </label>

          <label class="field">
            <span class="lab">Valeur (CAD)</span>
            <input name="value" inputmode="decimal" placeholder="0" bind:value={valueVal} />
          </label>
        </div>

        <div class="form__actions">
          <button class="btn btn--ghost" type="button" onclick={closeModal}>Annuler</button>
          <button class="btn btn--primary" type="submit">{modalCta}</button>
        </div>

        <div class="hint">Tips: <b>ESC</b> ferme la modal • <b>Ctrl/Cmd+K</b> focus la recherche.</div>
      </form>
    </div>
  </div>
</section>

<style>
  :global(:root){
    --primary: rgb(93,124,255);
    --ok: rgb(16,185,129);
    --bad: rgb(239,68,68);
    --warn: rgb(245,158,11);
    --info: rgb(59,130,246);

    --line: rgba(15,23,42,.08);
    --glass: rgba(255,255,255,.72);
    --shadow: 0 18px 55px rgba(15,23,42,.06);
  }

  .svg{ width: 18px; height: 18px; display:block; }

  .page{ display:grid; gap: 14px; }
  .titleRow{ display:flex; align-items:center; gap: 10px; }
  .badge{
    font-size: 11px;
    padding: 6px 10px;
    border-radius: 999px;
    background: rgba(93,124,255,.12);
    border: 1px solid rgba(93,124,255,.18);
    color: rgb(41,66,184);
    font-weight: 950;
    letter-spacing:.06em;
    text-transform: uppercase;
  }

  .head{
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
    gap: 12px;
    flex-wrap: wrap;
    padding: 6px 2px;
  }

  h1{ margin:0; font-size: 28px; letter-spacing: -.02em; font-weight: 1000; }
  .head p{ margin:6px 0 0; font-size: 13px; opacity:.72; }
  .hright{ display:flex; gap: 10px; align-items:center; flex-wrap:wrap; }

  .chip{
    display:inline-flex;
    gap: 10px;
    align-items:baseline;
    padding: 10px 12px;
    border-radius: 999px;
    background: var(--glass);
    border: 1px solid var(--line);
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

  .alert{
    font-size: 12px;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(185,28,28,.10);
    color: #b91c1c;
    border: 1px solid rgba(185,28,28,.18);
  }

  .toolbar{
    position: sticky;
    top: 86px;
    z-index: 4;
    padding: 6px 2px;
  }

  .toolbar__inner{
    display:grid;
    grid-template-columns: 1.4fr 1fr auto;
    gap: 12px;
    padding: 12px;
    border-radius: 18px;
    background: rgba(255,255,255,.70);
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  .filters{
    display:flex;
    gap: 10px;
    align-items:center;
    min-width: 0;
  }

  .search{
    flex: 1;
    min-width: 260px;
    position: relative;
  }
  .sicon{
    position:absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    padding: 8px;
    border-radius: 999px;
    background: rgba(15,23,42,.06);
    border: 1px solid rgba(15,23,42,.08);
    opacity: .85;
    user-select: none;
    display:grid;
    place-items:center;
  }
  .kbd{
    position:absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    padding: 6px 8px;
    border-radius: 999px;
    background: rgba(15,23,42,.05);
    border: 1px solid rgba(15,23,42,.08);
    opacity:.75;
    user-select:none;
  }
  .search input{
    width: 100%;
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(15,23,42,.035);
    padding: 12px 90px 12px 54px;
    border-radius: 14px;
    outline: none;
    font-size: 14px;
    transition: box-shadow .2s ease, border-color .2s ease, background .2s ease;
  }
  .search input:focus{
    border-color: rgba(93,124,255,.55);
    box-shadow: 0 0 0 5px rgba(93,124,255,.18);
    background: rgba(93,124,255,.06);
  }

  .selectWrap select{
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(15,23,42,.035);
    padding: 12px 12px;
    border-radius: 14px;
    outline: none;
    font-size: 14px;
  }
  .selectWrap select:focus{
    border-color: rgba(93,124,255,.55);
    box-shadow: 0 0 0 5px rgba(93,124,255,.18);
    background: rgba(93,124,255,.06);
  }

  .sortRow{ display:flex; gap: 10px; align-items:center; flex-wrap: wrap; }
  .sortWrap{
    display:flex;
    gap: 8px;
    align-items:center;
    padding: 8px 10px;
    border-radius: 16px;
    background: rgba(15,23,42,.05);
    border: 1px solid rgba(15,23,42,.08);
  }
  .sortLabel{ font-size: 11px; opacity:.7; font-weight: 900; }
  .sortWrap select{
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(255,255,255,.65);
    padding: 9px 10px;
    border-radius: 12px;
    outline: none;
    font-size: 13px;
  }

  .kpiRow{
    display:flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items:center;
    justify-content:flex-start;
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
  .tchip--ghost{ background: rgba(255,255,255,.65); }

  .actions{
    display:flex;
    gap: 10px;
    align-items:center;
    justify-content:flex-end;
    flex-wrap: wrap;
  }

  .btn{
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(255,255,255,.70);
    color: rgba(15,23,42,.92);
    border-radius: 14px;
    padding: 10px 12px;
    font-weight: 950;
    text-decoration:none;
    cursor:pointer;
    transition: transform .16s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
    display:inline-flex;
    align-items:center;
    gap: 10px;
  }
  .ico{
    width: 18px; height: 18px;
    display:inline-grid;
    place-items:center;
    opacity:.9;
  }
  .btn:hover{
    transform: translateY(-1px);
    box-shadow: 0 18px 40px rgba(15,23,42,.06);
    background: rgba(15,23,42,.04);
  }
  .btn--primary{
    background: linear-gradient(135deg, rgba(111,139,255,1), rgba(93,124,255,1));
    color: white;
    border-color: rgba(93,124,255,.22);
    box-shadow: 0 18px 45px rgba(93,124,255,.22);
  }
  .btn--primary:hover{ box-shadow: 0 26px 65px rgba(93,124,255,.28); }
  .btn--ghost{ background: rgba(15,23,42,.05); box-shadow:none; }
  .btn--danger{
    background: rgba(239,68,68,.10);
    border-color: rgba(239,68,68,.18);
    color: rgb(185,28,28);
  }
  .btn--danger:hover{
    background: rgba(239,68,68,.14);
    box-shadow: 0 18px 40px rgba(239,68,68,.10);
  }
  .btn--tiny{ padding: 9px 10px; border-radius: 12px; line-height: 1; }

  .inline{ margin: 0; }

  .grid{
    display:grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    align-items: start;
  }

  .card{
    position: relative;
    border-radius: 20px;
    background: rgba(255,255,255,.72);
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
    padding: 14px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: transform .18s ease, box-shadow .2s ease, border-color .2s ease;
  }
  .card:hover{
    transform: translateY(-2px);
    border-color: rgba(93,124,255,.18);
    box-shadow: 0 24px 70px rgba(15,23,42,.08);
  }

  .card__content{ position: relative; z-index: 1; }
  .stretched{
    position:absolute;
    inset: 0;
    border-radius: inherit;
    z-index: 2;
    outline: none;
  }
  .stretched:focus-visible{
    box-shadow: 0 0 0 5px rgba(93,124,255,.22);
  }
  .controls{ position: relative; z-index: 3; }

  .card__top{
    display:flex;
    justify-content:space-between;
    gap: 10px;
    align-items:flex-start;
  }

  .who{
    display:flex;
    gap: 10px;
    align-items:center;
    min-width: 0;
  }
  .avatar{
    width: 42px; height: 42px;
    border-radius: 16px;
    display:grid; place-items:center;
    font-weight: 1000;
    color: white;
    background: linear-gradient(135deg, rgba(111,139,255,1), rgba(93,124,255,1));
    box-shadow: 0 16px 40px rgba(93,124,255,.22);
    flex: 0 0 auto;
  }

  .meta{ display:grid; gap: 2px; min-width: 0; }
  .name{
    font-weight: 1000;
    letter-spacing:-.01em;
    white-space:nowrap;
    overflow:hidden;
    text-overflow: ellipsis;
  }
  .sub{
    font-size: 12px;
    opacity:.72;
    white-space:nowrap;
    overflow:hidden;
    text-overflow: ellipsis;
  }
  .date{ opacity:.85; }

  .pill{
    font-size: 12px;
    font-weight: 950;
    padding: 7px 10px;
    border-radius: 999px;
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(15,23,42,.04);
    white-space: nowrap;
    display:inline-flex;
    gap: 8px;
    align-items:center;
  }
  .dotS{ width: 8px; height: 8px; border-radius: 999px; }
  .mini{ font-size: 11px; opacity:.75; }

  .statusBox{ display:grid; gap: 8px; justify-items:end; }
  .quick{ margin:0; }
  .quickSelect{
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(255,255,255,.70);
    padding: 8px 10px;
    border-radius: 14px;
    font-weight: 900;
    font-size: 12px;
    outline: none;
  }
  .quickSelect:focus{
    border-color: rgba(93,124,255,.55);
    box-shadow: 0 0 0 5px rgba(93,124,255,.18);
  }

  .value{
    margin-top: 12px;
    padding: 12px;
    border-radius: 16px;
    background: rgba(15,23,42,.04);
    border: 1px solid rgba(15,23,42,.06);
    display:flex;
    justify-content:space-between;
    align-items:baseline;
    gap: 10px;
  }
  .vk{ font-size: 12px; opacity:.7; font-weight: 900; }
  .vv{ font-size: 16px; font-weight: 1000; letter-spacing:-.01em; }

  .card__actions{
    margin-top: 12px;
    display:flex;
    gap: 10px;
    justify-content:space-between;
    align-items:center;
    flex-wrap: wrap;
  }

  .empty{
    padding: 22px;
    border-radius: 20px;
    background: rgba(15,23,42,.04);
    border: 1px solid rgba(15,23,42,.06);
    text-align:center;
    display:grid;
    gap: 8px;
  }
  .empty__icon{ font-size: 34px; }
  .empty h2{ margin: 0; font-size: 18px; font-weight: 1000; }
  .empty p{ margin: 0; font-size: 12px; opacity:.72; }

  .card--skel{ position: relative; overflow:hidden; }
  .card--skel::before{
    content:"";
    position:absolute; inset:0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.65), transparent);
    transform: translateX(-100%);
    animation: shimmer 1.1s ease-in-out infinite;
  }
  .sk{ height: 12px; border-radius: 999px; background: rgba(15,23,42,.10); }
  .sk1{ width: 55%; }
  .sk2{ width: 75%; margin-top: 12px; }
  .sk3{ width: 35%; margin-top: 12px; height: 22px; border-radius: 14px; }
  .sk4{ width: 60%; margin-top: 12px; }
  @keyframes shimmer{ 0%{ transform: translateX(-100%);} 100%{ transform: translateX(100%);} }

  .modal{ position: fixed; inset: 0; pointer-events: none; z-index: 50; }
  .modal[data-open="1"]{ pointer-events: auto; }

  .backdrop{
    position:absolute;
    inset: 0;
    background: rgba(15,23,42,.38);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    opacity: 0;
    transition: opacity .18s ease;
  }
  .modal[data-open="1"] .backdrop{ opacity: 1; }

  .dialog{
    position:absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -46%) scale(.98);
    width: min(520px, calc(100vw - 24px));
    border-radius: 22px;
    background: rgba(255,255,255,.82);
    border: 1px solid rgba(255,255,255,.65);
    box-shadow: 0 40px 120px rgba(15,23,42,.22);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    opacity: 0;
    transition: opacity .20s ease, transform .20s ease;
  }
  .modal[data-open="1"] .dialog{
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }

  .dialog__head{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap: 10px;
    padding: 16px 16px 0;
  }
  .eyebrow{
    font-size: 11px;
    opacity:.65;
    font-weight: 900;
    letter-spacing: .10em;
    text-transform: uppercase;
  }
  .dialog h3{
    margin: 2px 0 0;
    font-size: 18px;
    letter-spacing: -.02em;
    font-weight: 1000;
  }
  .x{
    width: 38px; height: 38px;
    border-radius: 14px;
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(15,23,42,.04);
    cursor:pointer;
    font-weight: 1000;
  }

  .form{ padding: 14px 16px 16px; display:grid; gap: 12px; }
  .field{ display:grid; gap: 6px; }
  .lab{ font-size: 12px; opacity:.7; font-weight: 900; }

  .field input, .field select{
    width: 100%;
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(15,23,42,.035);
    padding: 12px 12px;
    border-radius: 14px;
    outline: none;
    font-size: 14px;
    transition: box-shadow .2s ease, border-color .2s ease, background .2s ease;
  }
  .field input:focus, .field select:focus{
    border-color: rgba(93,124,255,.55);
    box-shadow: 0 0 0 5px rgba(93,124,255,.18);
    background: rgba(93,124,255,.06);
  }

  .row2{ display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .form__actions{
    display:flex;
    justify-content:flex-end;
    gap: 10px;
    margin-top: 2px;
  }

  .hint{ font-size: 12px; opacity:.72; padding-top: 2px; }

  @media (max-width: 1100px){
    .toolbar__inner{ grid-template-columns: 1fr; }
    .actions{ justify-content:flex-start; }
    .grid{ grid-template-columns: 1fr; }
    .row2{ grid-template-columns: 1fr; }
    .toolbar{ position: relative; top: 0; }
    .statusBox{ justify-items:start; }
  }

  @media (prefers-reduced-motion: reduce){
    .dot{ animation: none !important; }
    .card, .btn, .backdrop, .dialog, .card--skel::before{ transition: none !important; }
    .card--skel::before{ animation: none !important; }
  }
</style>
