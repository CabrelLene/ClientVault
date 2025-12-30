<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import ToastHost from '$lib/components/ToastHost.svelte';
  import { toast } from '$lib/stores/toast';

  export let data: { user: { email?: string | null } };

  const crumb = (pathname: string) => {
    if (pathname === '/app') return 'Dashboard';
    if (pathname.startsWith('/app/clients')) return 'Clients';
    return 'App';
  };

  // Toast via query params: ?toast=...&type=success|info|error
  // IMPORTANT: exécuter uniquement côté navigateur
  $: if (browser) {
    const msg = $page.url.searchParams.get('toast');
    const type = $page.url.searchParams.get('type') ?? 'success';

    if (msg) {
      if (type === 'error') toast.error(msg);
      else if (type === 'info') toast.info(msg);
      else toast.success(msg);

      // Clean URL sans goto() (client only)
      const u = new URL(window.location.href);
      u.searchParams.delete('toast');
      u.searchParams.delete('type');
      window.history.replaceState({}, '', u.pathname + u.search);
    }
  }
</script>

<ToastHost />

<div class="shell">
  <aside class="side">
    <div class="brand">
      <div class="logo">CV</div>
      <div>
        <div class="name">ClientVault</div>
        <div class="mail">{data.user.email ?? '—'}</div>
      </div>
    </div>

    <nav class="menu">
      <a class:active={$page.url.pathname === '/app'} href="/app">Dashboard</a>
      <a class:active={$page.url.pathname.startsWith('/app/clients')} href="/app/clients">Clients</a>

      <form method="POST" action="/app/seed" class="inline">
        <button class="seed" type="submit">Charger démo</button>
      </form>

      <form method="POST" action="/app/logout" class="inline">
        <button class="logout" type="submit">Logout</button>
      </form>
    </nav>
  </aside>

  <main class="main">
    <header class="topbar">
      <div class="crumb">{crumb($page.url.pathname)}</div>
      <div class="actions">
        <a class="ghost" href="/app/clients">+ Ajouter un client</a>
        <a class="ghost" href="/app/clients/export">Export CSV</a>
      </div>
    </header>

    <div class="content">
      <slot />
    </div>
  </main>
</div>

<style>
  .shell{
    min-height: 100vh;
    display:grid;
    grid-template-columns: 260px 1fr;
    background: radial-gradient(1200px 600px at 30% 20%, #ffffff 0%, #eef2ff 45%, #f6f7fb 100%);
  }

  .side{
    padding: 18px;
    border-right: 1px solid rgba(15,23,42,.08);
    background: rgba(255,255,255,.60);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .brand{ display:flex; gap:12px; align-items:center; padding: 8px 8px 16px; }
  .logo{
    width: 46px; height: 46px; border-radius: 16px;
    background: linear-gradient(135deg, #6f8bff, #5d7cff);
    color:white; display:grid; place-items:center;
    font-weight: 1000; letter-spacing: -.02em;
    box-shadow: 0 18px 40px rgba(93,124,255,.30);
  }
  .name{ font-weight: 1000; letter-spacing:-0.01em; }
  .mail{ font-size: 12px; opacity:.7; margin-top: 2px; }

  .menu{ display:grid; gap: 10px; padding: 6px 8px; }
  .menu a{
    text-decoration:none; color: rgba(15,23,42,.92);
    font-weight: 900;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(15,23,42,.05);
  }
  .menu a:hover{ background: rgba(15,23,42,.08); }
  .menu a.active{ background: rgba(93,124,255,.14); color: #2942b8; }

  .inline{ margin: 0; }
  .seed, .logout{
    width: 100%;
    border:0; cursor:pointer;
    padding: 10px 12px;
    border-radius: 14px;
    font-weight: 1000;
    background: rgba(15,23,42,.05);
    text-align:left;
  }
  .seed:hover{ background: rgba(93,124,255,.12); }
  .logout{ background: rgba(185,28,28,.10); color:#b91c1c; }
  .logout:hover{ background: rgba(185,28,28,.14); }

  .main{ padding: 16px; }
  .topbar{
    display:flex; justify-content:space-between; align-items:center; gap: 12px;
    padding: 14px 16px;
    border-radius: 18px;
    background: rgba(255,255,255,.70);
    border: 1px solid rgba(15,23,42,.08);
    box-shadow: 0 20px 60px rgba(15,23,42,.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }
  .crumb{ font-weight: 1000; letter-spacing:-0.01em; opacity:.9; }
  .actions{ display:flex; gap: 10px; align-items:center; flex-wrap:wrap; }
  .ghost{
    text-decoration:none;
    display:inline-flex; align-items:center;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(15,23,42,.06);
    color: rgba(15,23,42,.92);
    font-weight: 900;
  }
  .ghost:hover{ background: rgba(15,23,42,.09); }

  .content{ padding-top: 14px; }

  @media (max-width: 960px){
    .shell{ grid-template-columns: 1fr; }
    .side{ border-right: 0; border-bottom: 1px solid rgba(15,23,42,.08); }
    .menu{ grid-template-columns: repeat(2, 1fr); }
    .seed, .logout{ text-align:center; }
  }
</style>
