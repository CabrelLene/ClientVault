<script lang="ts">
  import StatusPill from '$lib/components/StatusPill.svelte';
  import type { PageData, ActionData } from './$types';

  type ClientRow = {
    id: string;
    name: string;
    company: string | null;
    status: string;
    value: number;
    created_at: string;
  };

  let { data, form } = $props<{ data: PageData; form: ActionData }>();

  let createDlg: HTMLDialogElement | null = null;
  let editDlg: HTMLDialogElement | null = null;

  let edit: ClientRow | null = null;

  const money = (n: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(n || 0);

  const dateShort = (iso: string) => {
    try {
      return new Intl.DateTimeFormat('fr-CA', { year: 'numeric', month: 'short', day: '2-digit' }).format(
        new Date(iso)
      );
    } catch {
      return iso;
    }
  };

  const openCreate = () => createDlg?.showModal();
  const openEdit = (c: ClientRow) => {
    edit = c;
    editDlg?.showModal();
  };

  const kpis = () => {
    const list = (data.clients ?? []) as ClientRow[];
    const total = list.length;
    const totalValue = list.reduce((s, c) => s + (c.value || 0), 0);
    const openValue = list
      .filter((c) => c.status !== 'Gagné' && c.status !== 'Perdu')
      .reduce((s, c) => s + (c.value || 0), 0);

    return { total, totalValue, openValue };
  };
</script>

{#if data.loadError}
  <div class="err">
    <div class="err__title">Erreur</div>
    <div class="err__text">{data.loadError}</div>
  </div>
{/if}

{#if form?.error}
  <div class="err err--soft">
    <div class="err__title">Action refusée</div>
    <div class="err__text">{form.error}</div>
  </div>
{/if}

<div class="wrap">
  <div class="head">
    <div>
      <h1 class="h1">Clients</h1>
      <p class="sub">Recherche, statut, valeur — propre et rapide.</p>
    </div>

    <div class="head__right">
      <div class="kpi">
        <div class="kpi__n">{kpis().total}</div>
        <div class="kpi__t">clients</div>
      </div>
      <div class="kpi">
        <div class="kpi__n">{money(kpis().openValue)}</div>
        <div class="kpi__t">en cours</div>
      </div>

      <button class="btn btn--primary" type="button" on:click={openCreate}>
        + Nouveau
      </button>
    </div>
  </div>

  <!-- Filters -->
  <form class="filters" method="GET">
    <div class="field">
      <div class="label">Recherche</div>
      <input
        class="input"
        name="q"
        placeholder="Nom ou compagnie…"
        value={data.q}
        autocomplete="off"
      />
    </div>

    <div class="field">
      <div class="label">Statut</div>
      <select class="input" name="status">
        <option value="all" selected={data.status === 'all'}>Tous</option>
        {#each data.statuses as s}
          <option value={s} selected={data.status === s}>{s}</option>
        {/each}
      </select>
    </div>

    <div class="filters__actions">
      <button class="btn" type="submit">Filtrer</button>
      <a class="btn btn--ghost" href="/app/clients">Reset</a>
    </div>
  </form>

  <!-- Desktop table -->
  <div class="table">
    <div class="thead">
      <div>Client</div>
      <div>Statut</div>
      <div class="right">Valeur</div>
      <div class="right">Créé</div>
      <div class="right">Actions</div>
    </div>

    <div class="tbody">
      {#if data.clients.length === 0}
        <div class="empty">
          Aucun résultat. Essaie un autre filtre, ou charge la démo.
        </div>
      {:else}
        {#each data.clients as c (c.id)}
          <div class="tr">
            <div class="cell">
              <div class="title">{c.company ?? c.name}</div>
              <div class="muted">{c.company ? c.name : '—'}</div>
            </div>

            <div class="cell">
              <StatusPill status={c.status} />
            </div>

            <div class="cell right mono">{money(c.value)}</div>
            <div class="cell right muted">{dateShort(c.created_at)}</div>

            <div class="cell right actions">
              <button class="icon" type="button" title="Modifier" on:click={() => openEdit(c)}>
                ✏️
              </button>

              <form
                method="POST"
                action="?/remove"
                on:submit={(e) => {
                  if (!confirm(`Supprimer "${c.company ?? c.name}" ?`)) e.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={c.id} />
                <button class="icon icon--danger" type="submit" title="Supprimer">🗑️</button>
              </form>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- Mobile cards -->
  <div class="cards">
    {#each data.clients as c (c.id)}
      <div class="card">
        <div class="card__top">
          <div>
            <div class="title">{c.company ?? c.name}</div>
            <div class="muted">{c.company ? c.name : '—'}</div>
          </div>
          <StatusPill status={c.status} />
        </div>

        <div class="card__meta">
          <div class="m">
            <div class="m__k">Valeur</div>
            <div class="m__v mono">{money(c.value)}</div>
          </div>
          <div class="m">
            <div class="m__k">Créé</div>
            <div class="m__v">{dateShort(c.created_at)}</div>
          </div>
        </div>

        <div class="card__actions">
          <button class="btn btn--ghost" type="button" on:click={() => openEdit(c)}>Modifier</button>

          <form
            method="POST"
            action="?/remove"
            on:submit={(e) => {
              if (!confirm(`Supprimer "${c.company ?? c.name}" ?`)) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={c.id} />
            <button class="btn btn--danger" type="submit">Supprimer</button>
          </form>
        </div>
      </div>
    {/each}
  </div>
</div>

<!-- Create modal -->
<dialog class="dlg" bind:this={createDlg}>
  <form method="POST" action="?/create" class="dlg__card">
    <div class="dlg__head">
      <div>
        <div class="dlg__title">Nouveau client</div>
        <div class="dlg__sub">Ajoute un prospect et commence le suivi.</div>
      </div>
      <button class="x" type="button" on:click={() => createDlg?.close()}>✕</button>
    </div>

    <div class="dlg__grid">
      <label class="f">
        <span>Nom *</span>
        <input class="input" name="name" required placeholder="Ex: Cabrel Ange" />
      </label>

      <label class="f">
        <span>Compagnie</span>
        <input class="input" name="company" placeholder="Ex: Phoenix Digital Solutions" />
      </label>

      <label class="f">
        <span>Statut</span>
        <select class="input" name="status">
          {#each data.statuses as s}
            <option value={s} selected={s === 'Nouveau'}>{s}</option>
          {/each}
        </select>
      </label>

      <label class="f">
        <span>Valeur (CAD)</span>
        <input class="input" name="value" inputmode="decimal" placeholder="Ex: 2500" />
      </label>
    </div>

    <div class="dlg__actions">
      <button class="btn btn--ghost" type="button" on:click={() => createDlg?.close()}>Annuler</button>
      <button class="btn btn--primary" type="submit">Créer</button>
    </div>
  </form>
</dialog>

<!-- Edit modal -->
<dialog class="dlg" bind:this={editDlg}>
  <form method="POST" action="?/update" class="dlg__card">
    <div class="dlg__head">
      <div>
        <div class="dlg__title">Modifier</div>
        <div class="dlg__sub">Met à jour le statut, la valeur, etc.</div>
      </div>
      <button class="x" type="button" on:click={() => editDlg?.close()}>✕</button>
    </div>

    {#if edit}
      <input type="hidden" name="id" value={edit.id} />

      <div class="dlg__grid">
        <label class="f">
          <span>Nom *</span>
          <input class="input" name="name" required value={edit.name} />
        </label>

        <label class="f">
          <span>Compagnie</span>
          <input class="input" name="company" value={edit.company ?? ''} />
        </label>

        <label class="f">
          <span>Statut</span>
          <select class="input" name="status" value={edit.status}>
            {#each data.statuses as s}
              <option value={s}>{s}</option>
            {/each}
          </select>
        </label>

        <label class="f">
          <span>Valeur (CAD)</span>
          <input class="input" name="value" inputmode="decimal" value={String(edit.value ?? 0)} />
        </label>
      </div>
    {/if}

    <div class="dlg__actions">
      <button class="btn btn--ghost" type="button" on:click={() => editDlg?.close()}>Annuler</button>
      <button class="btn btn--primary" type="submit">Enregistrer</button>
    </div>
  </form>
</dialog>

<style>
  .wrap{ display:grid; gap: 12px; }

  .head{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap: 12px;
  }
  .head__right{
    display:flex;
    align-items:center;
    gap: 10px;
    flex-wrap:wrap;
    justify-content:flex-end;
  }

  .h1{
    margin: 0;
    font-size: 30px;
    letter-spacing:-0.03em;
    font-weight: 1000;
  }
  .sub{ margin: 4px 0 0; opacity:.68; }

  .kpi{
    padding: 10px 12px;
    border-radius: 16px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(15,23,42,.08);
    box-shadow: 0 16px 60px rgba(15,23,42,.08);
    min-width: 120px;
    text-align:right;
  }
  .kpi__n{ font-weight: 1000; letter-spacing:-0.02em; }
  .kpi__t{ font-size: 12px; opacity:.65; margin-top: 2px; }

  .filters{
    display:grid;
    grid-template-columns: 1.2fr .8fr auto;
    gap: 10px;
    padding: 12px;
    border-radius: 22px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(15,23,42,.08);
    box-shadow: 0 18px 60px rgba(15,23,42,.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .field{ display:grid; gap: 6px; }
  .label{ font-size: 12px; opacity:.7; font-weight: 900; }

  .input{
    width: 100%;
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(15,23,42,.04);
  }
  .input:focus{
    outline: none;
    box-shadow: 0 0 0 4px rgba(93,124,255,.20);
    border-color: rgba(93,124,255,.45);
  }

  .filters__actions{ display:flex; gap: 10px; align-items:end; justify-content:flex-end; }

  .btn{
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(15,23,42,.06);
    padding: 10px 12px;
    border-radius: 14px;
    font-weight: 1000;
    cursor:pointer;
    text-decoration:none;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    transition: transform .15s cubic-bezier(.2,.8,.2,1), background .2s cubic-bezier(.2,.8,.2,1);
  }
  .btn:hover{ background: rgba(15,23,42,.09); transform: translateY(-1px); }
  .btn:active{ transform: translateY(0) scale(.99); }

  .btn--primary{
    background: rgba(93,124,255,.16);
    border-color: rgba(93,124,255,.22);
    color: rgba(37,99,235,.95);
  }
  .btn--primary:hover{ background: rgba(93,124,255,.20); }

  .btn--ghost{ background: rgba(255,255,255,.55); }
  .btn--danger{
    background: rgba(239,68,68,.10);
    border-color: rgba(239,68,68,.18);
    color: rgba(185,28,28,.95);
  }
  .btn--danger:hover{ background: rgba(239,68,68,.14); }

  .table{
    border-radius: 22px;
    overflow:hidden;
    border: 1px solid rgba(15,23,42,.08);
    background: rgba(255,255,255,.72);
    box-shadow: 0 18px 60px rgba(15,23,42,.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .thead, .tr{
    display:grid;
    grid-template-columns: 1.6fr .7fr .5fr .6fr .5fr;
    gap: 10px;
    padding: 12px 14px;
    align-items:center;
  }
  .thead{
    background: rgba(15,23,42,.04);
    font-size: 12px;
    font-weight: 1000;
    opacity:.75;
  }
  .tbody{ display:grid; }
  .tr{
    border-top: 1px solid rgba(15,23,42,.06);
    transition: background .2s cubic-bezier(.2,.8,.2,1);
  }
  .tr:hover{ background: rgba(15,23,42,.03); }

  .cell{ min-width: 0; }
  .title{
    font-weight: 1000;
    letter-spacing:-0.01em;
    white-space: nowrap;
    overflow:hidden;
    text-overflow: ellipsis;
  }
  .muted{
    font-size: 12px;
    opacity:.65;
    margin-top: 2px;
    white-space: nowrap;
    overflow:hidden;
    text-overflow: ellipsis;
  }
  .right{ text-align:right; }
  .mono{ font-variant-numeric: tabular-nums; }

  .actions{ display:flex; gap: 10px; justify-content:flex-end; align-items:center; }
  .icon{
    width: 38px; height: 38px;
    border-radius: 14px;
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(15,23,42,.06);
    cursor:pointer;
    display:grid;
    place-items:center;
    transition: transform .15s cubic-bezier(.2,.8,.2,1), background .2s cubic-bezier(.2,.8,.2,1);
  }
  .icon:hover{ background: rgba(15,23,42,.10); transform: translateY(-1px); }
  .icon:active{ transform: translateY(0) scale(.99); }
  .icon--danger{
    background: rgba(239,68,68,.10);
    border-color: rgba(239,68,68,.18);
  }
  .icon--danger:hover{ background: rgba(239,68,68,.14); }

  .empty{
    padding: 14px;
    border-top: 1px solid rgba(15,23,42,.06);
    opacity:.75;
  }

  /* Mobile cards */
  .cards{ display:none; gap: 10px; }
  .card{
    border-radius: 22px;
    border: 1px solid rgba(15,23,42,.08);
    background: rgba(255,255,255,.72);
    box-shadow: 0 18px 60px rgba(15,23,42,.08);
    padding: 12px;
  }
  .card__top{
    display:flex; justify-content:space-between; align-items:flex-start; gap: 10px;
  }
  .card__meta{
    display:grid; grid-template-columns: 1fr 1fr; gap: 10px;
    margin-top: 10px;
  }
  .m{ padding: 10px; border-radius: 16px; background: rgba(15,23,42,.04); border: 1px solid rgba(15,23,42,.06); }
  .m__k{ font-size: 12px; opacity:.65; font-weight: 900; }
  .m__v{ margin-top: 4px; font-weight: 1000; }

  .card__actions{
    display:flex; gap: 10px; margin-top: 10px; justify-content:flex-end;
  }

  /* Dialog */
  .dlg::backdrop{ background: rgba(15,23,42,.35); backdrop-filter: blur(4px); }
  .dlg{
    border: 0;
    padding: 0;
    background: transparent;
  }
  .dlg__card{
    width: min(640px, calc(100vw - 24px));
    border-radius: 22px;
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(255,255,255,.85);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 30px 100px rgba(15,23,42,.18);
    padding: 14px;
  }
  .dlg__head{
    display:flex; justify-content:space-between; align-items:flex-start; gap: 10px;
    padding: 6px 4px 12px;
  }
  .dlg__title{ font-weight: 1000; letter-spacing:-0.01em; font-size: 16px; }
  .dlg__sub{ font-size: 12px; opacity:.65; margin-top: 2px; }
  .x{
    width: 40px; height: 40px;
    border-radius: 14px;
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(15,23,42,.06);
    cursor:pointer;
  }
  .x:hover{ background: rgba(15,23,42,.10); }

  .dlg__grid{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    padding: 6px 4px 12px;
  }
  .f{ display:grid; gap: 6px; }
  .f span{ font-size: 12px; opacity:.7; font-weight: 900; }

  .dlg__actions{
    display:flex; justify-content:flex-end; gap: 10px;
    padding: 6px 4px 2px;
  }

  /* Errors */
  .err{
    padding: 14px;
    border-radius: 18px;
    border: 1px solid rgba(239,68,68,.20);
    background: rgba(239,68,68,.08);
  }
  .err--soft{
    border-color: rgba(245,158,11,.22);
    background: rgba(245,158,11,.10);
  }
  .err__title{ font-weight: 1000; }
  .err__text{ opacity:.85; margin-top: 6px; }

  @media (max-width: 980px){
    .filters{ grid-template-columns: 1fr; }
    .filters__actions{ justify-content:stretch; }
    .filters__actions .btn{ flex: 1; }

    .table{ display:none; }
    .cards{ display:grid; }
    .dlg__grid{ grid-template-columns: 1fr; }
    .head{ flex-direction: column; align-items: stretch; }
    .head__right{ justify-content:space-between; }
  }
</style>
