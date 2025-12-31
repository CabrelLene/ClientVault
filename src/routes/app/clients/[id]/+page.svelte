<script lang="ts">
  import { navigating } from '$app/stores';
  import { goto } from '$app/navigation';

  type Status = 'Nouveau' | 'Qualifié' | 'Proposé' | 'Gagné' | 'Perdu';

  type Client = {
    id: string;
    name: string;
    company: string | null;
    status: Status;
    value: number | null;
    created_at: string;
  };

  type Task = {
    id: string;
    title: string;
    done: boolean;
    due_date: string | null;
    created_at: string;
  };

  type Data = {
    today: string;
    statuses: readonly Status[];
    client: Client | null;
    tasks: Task[];
    loadError: string | null;
  };

  let { data } = $props<{ data: Data }>();
  const isLoading = $derived($navigating !== null);

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

  const dueLabel = (iso: string | null) => {
    if (!iso) return '—';
    if (iso === data.today) return "aujourd’hui";
    return iso;
  };

  // Edit form state (bind à l’UI)
  let nameVal = $state('');
  let companyVal = $state('');
  let statusVal = $state<Status>('Nouveau');
  let valueVal = $state('');

  $effect(() => {
    if (!data.client) return;
    nameVal = data.client.name ?? '';
    companyVal = data.client.company ?? '';
    statusVal = data.client.status ?? 'Nouveau';
    valueVal = data.client.value == null ? '' : String(Number(data.client.value) || 0);
  });

  // Add task
  let taskTitle = $state('');
  let taskDue = $state('');

  function confirmDeleteClient() {
    return confirm('Supprimer ce client et ses tâches ?');
  }
</script>

{#if data.loadError}
  <div class="alert">⚠️ {data.loadError}</div>
{/if}

{#if !data.client}
  <div class="empty">
    <div class="empty__icon">🕵️‍♂️</div>
    <h1>Client introuvable</h1>
    <p>Soit l’ID est invalide, soit tu n’as pas accès à ce client.</p>
    <button class="btn btn--primary" type="button" onclick={() => goto('/app/clients')}>Retour Clients</button>
  </div>
{:else}
  <section class="page">
    <header class="head">
      <div class="left">
        <button class="back" type="button" onclick={() => goto('/app/clients')} aria-label="Retour">
          <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
            <path d="M15 18l-6-6l6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>

        <div class="who">
          <div class="avatar">{data.client.name?.slice(0, 1)?.toUpperCase() ?? 'C'}</div>
          <div class="meta">
            <h1 class="name">{data.client.name}</h1>
            <div class="sub">
              {data.client.company ?? '—'} •
              <span class="pill" style={`background:${statusMeta(data.client.status).bg};border-color:${statusMeta(data.client.status).bd};color:${statusMeta(data.client.status).tx}`}>
                <span class="dotS" style={`background:${statusMeta(data.client.status).tx}`}></span>
                {data.client.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="right">
        <span class="chip chip--primary">
          <span class="k">Valeur</span>
          <span class="v">{money(Number(data.client.value) || 0)}</span>
        </span>

        {#if isLoading}
          <span class="chip chip--loading"><span class="dot"></span> Mise à jour…</span>
        {/if}
      </div>
    </header>

    <div class="grid">
      <!-- EDIT CLIENT -->
      <article class="card">
        <div class="card__head">
          <div>
            <div class="eyebrow">Client</div>
            <h2>Informations</h2>
          </div>

          <form method="POST" action="?/deleteClient" onsubmit={() => confirmDeleteClient()} class="inline">
            <button class="btn btn--danger" type="submit">
              <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
                <path d="M3 6h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <path d="M8 6V4h8v2m-1 0v14H9V6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
              </svg>
              Supprimer
            </button>
          </form>
        </div>

        <form method="POST" action="?/updateClient" class="form">
          <label class="field">
            <span class="lab">Nom *</span>
            <input name="name" required bind:value={nameVal} />
          </label>

          <label class="field">
            <span class="lab">Entreprise</span>
            <input name="company" bind:value={companyVal} />
          </label>

          <div class="row2">
            <label class="field">
              <span class="lab">Statut</span>
              <select name="status" bind:value={statusVal}>
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

          <div class="actions">
            <button class="btn btn--primary" type="submit">
              <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Enregistrer
            </button>
          </div>
        </form>
      </article>

      <!-- TASKS -->
      <article class="card">
        <div class="card__head">
          <div>
            <div class="eyebrow">To-Do</div>
            <h2>Tâches</h2>
          </div>
        </div>

        <form method="POST" action="?/addTask" class="taskAdd">
          <div class="taskRow">
            <div class="taskInput">
              <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
                <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
              <input name="title" placeholder="Nouvelle tâche…" bind:value={taskTitle} required />
            </div>

            <input class="due" name="due_date" type="date" bind:value={taskDue} />

            <button class="btn btn--ghost" type="submit">Ajouter</button>
          </div>
        </form>

        <div class="list">
          {#if data.tasks.length === 0}
            <div class="emptyMini">Aucune tâche. Ajoute-en une et avance 🔥</div>
          {:else}
            {#each data.tasks as t (t.id)}
              <div class="titem" data-done={t.done ? '1' : '0'}>
                <form method="POST" action="?/toggleTask" class="inline">
                  <input type="hidden" name="id" value={t.id} />
                  <input type="hidden" name="done" value={String(!t.done)} />
                  <button class="check" type="submit" aria-label="Toggle">
                    {#if t.done}
                      <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
                        <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    {:else}
                      <span class="circle"></span>
                    {/if}
                  </button>
                </form>

                <div class="tmeta">
                  <div class="ttitle">{t.title}</div>
                  <div class="tsub">
                    due: <b>{dueLabel(t.due_date)}</b>
                  </div>
                </div>

                <form method="POST" action="?/deleteTask" class="inline">
                  <input type="hidden" name="id" value={t.id} />
                  <button class="trash" type="submit" aria-label="Supprimer tâche">
                    <svg viewBox="0 0 24 24" class="svg" aria-hidden="true">
                      <path d="M3 6h18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                      <path d="M8 6V4h8v2m-1 0v14H9V6" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
                    </svg>
                  </button>
                </form>
              </div>
            {/each}
          {/if}
        </div>
      </article>
    </div>
  </section>
{/if}

<style>
  :global(:root){
    --primary: rgb(93,124,255);
    --ok: rgb(16,185,129);
    --bad: rgb(239,68,68);
    --line: rgba(15,23,42,.08);
    --glass: rgba(255,255,255,.72);
    --shadow: 0 18px 55px rgba(15,23,42,.06);
  }

  .svg{ width: 18px; height: 18px; display:block; }
  .inline{ margin: 0; }

  .alert{
    font-size: 12px;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(185,28,28,.10);
    color: #b91c1c;
    border: 1px solid rgba(185,28,28,.18);
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
  .empty h1{ margin: 0; font-size: 18px; font-weight: 1000; }
  .empty p{ margin: 0; font-size: 12px; opacity:.72; }

  .page{ display:grid; gap: 14px; }

  .head{
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
    gap: 12px;
    flex-wrap: wrap;
    padding: 6px 2px;
  }

  .left{ display:flex; gap: 12px; align-items:center; min-width: 0; }
  .back{
    width: 42px; height: 42px;
    border-radius: 16px;
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(15,23,42,.04);
    cursor:pointer;
  }

  .who{ display:flex; gap: 10px; align-items:center; min-width: 0; }
  .avatar{
    width: 46px; height: 46px;
    border-radius: 18px;
    display:grid; place-items:center;
    font-weight: 1000;
    color: white;
    background: linear-gradient(135deg, rgba(111,139,255,1), rgba(93,124,255,1));
    box-shadow: 0 16px 40px rgba(93,124,255,.22);
    flex: 0 0 auto;
  }
  .meta{ display:grid; gap: 4px; min-width: 0; }
  .name{
    margin: 0;
    font-size: 22px;
    font-weight: 1000;
    letter-spacing:-.02em;
    white-space: nowrap;
    overflow:hidden;
    text-overflow: ellipsis;
  }
  .sub{ font-size: 12px; opacity:.75; display:flex; gap: 8px; align-items:center; flex-wrap: wrap; }

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

  .right{ display:flex; gap: 10px; align-items:center; flex-wrap:wrap; }

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
  @keyframes pulse{ 0%,100%{ transform: scale(1); opacity: .9; } 50%{ transform: scale(1.1); opacity: 1; } }

  .grid{
    display:grid;
    grid-template-columns: 1.05fr .95fr;
    gap: 12px;
    align-items:start;
  }

  .card{
    border-radius: 20px;
    background: rgba(255,255,255,.72);
    border: 1px solid var(--line);
    box-shadow: var(--shadow);
    padding: 14px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .card__head{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap: 12px;
    padding-bottom: 10px;
  }
  .eyebrow{
    font-size: 11px;
    opacity:.65;
    font-weight: 900;
    letter-spacing: .10em;
    text-transform: uppercase;
  }
  h2{
    margin: 2px 0 0;
    font-size: 18px;
    letter-spacing: -.02em;
    font-weight: 1000;
  }

  .form{ display:grid; gap: 12px; }
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
  }
  .row2{ display:grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .actions{ display:flex; justify-content:flex-end; padding-top: 4px; }

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
  .btn:hover{ transform: translateY(-1px); box-shadow: 0 18px 40px rgba(15,23,42,.06); background: rgba(15,23,42,.04); }
  .btn--primary{
    background: linear-gradient(135deg, rgba(111,139,255,1), rgba(93,124,255,1));
    color: white;
    border-color: rgba(93,124,255,.22);
    box-shadow: 0 18px 45px rgba(93,124,255,.22);
  }
  .btn--ghost{ background: rgba(15,23,42,.05); box-shadow:none; }
  .btn--danger{
    background: rgba(239,68,68,.10);
    border-color: rgba(239,68,68,.18);
    color: rgb(185,28,28);
  }

  .taskAdd{ margin-top: 6px; }
  .taskRow{ display:flex; gap: 10px; align-items:center; flex-wrap: wrap; }
  .taskInput{
    flex: 1;
    min-width: 220px;
    display:flex;
    gap: 10px;
    align-items:center;
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(15,23,42,.035);
  }
  .taskInput input{
    border:0;
    outline:none;
    background: transparent;
    width: 100%;
    font-size: 14px;
  }
  .due{
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(15,23,42,.035);
    padding: 10px 12px;
    border-radius: 14px;
    outline: none;
    font-size: 13px;
  }

  .list{ margin-top: 12px; display:grid; gap: 10px; }
  .emptyMini{
    padding: 12px;
    border-radius: 16px;
    background: rgba(15,23,42,.04);
    border: 1px dashed rgba(15,23,42,.12);
    font-size: 12px;
    opacity:.75;
  }

  .titem{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 10px;
    padding: 12px;
    border-radius: 16px;
    background: rgba(15,23,42,.04);
    border: 1px solid rgba(15,23,42,.06);
  }
  .titem[data-done="1"]{ opacity: .72; }
  .check{
    width: 40px; height: 40px;
    border-radius: 14px;
    border: 1px solid rgba(15,23,42,.10);
    background: rgba(255,255,255,.70);
    cursor:pointer;
    display:grid;
    place-items:center;
  }
  .circle{
    width: 14px; height: 14px;
    border-radius: 999px;
    border: 2px solid rgba(15,23,42,.35);
  }

  .tmeta{ min-width: 0; display:grid; gap: 3px; flex: 1; }
  .ttitle{
    font-weight: 1000;
    white-space: nowrap;
    overflow:hidden;
    text-overflow: ellipsis;
  }
  .tsub{ font-size: 12px; opacity:.72; }

  .trash{
    width: 40px; height: 40px;
    border-radius: 14px;
    border: 1px solid rgba(239,68,68,.18);
    background: rgba(239,68,68,.10);
    color: rgb(185,28,28);
    cursor:pointer;
    display:grid;
    place-items:center;
  }

  @media (max-width: 1100px){
    .grid{ grid-template-columns: 1fr; }
    .row2{ grid-template-columns: 1fr; }
  }
</style>
