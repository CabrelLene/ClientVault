<script lang="ts">
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { fly, fade } from 'svelte/transition';
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
      {#key $page.url.pathname}
        <!-- Fade wrapper -->
        <div class="page-fade" transition:fade={{ duration: 220 }}>
          <!-- Fly inner -->
          <div
            class="page-anim"
            in:fly={{ y: 10, duration: 220 }}
            out:fly={{ y: -6, duration: 160 }}
          >
            <slot />
          </div>
        </div>
      {/key}
    </div>
  </main>
</div>

<style>
  /* Layout */
  .shell{
    min-height: 100vh;
    display:grid;
    grid-template-columns: 260px 1fr;
    background: radial-gradient(1200px 600px at 30% 20%, #ffffff 0%, #eef2ff 45%, #f6f7fb 100%);
  }

  /* Sidebar */
  .side{
    padding: 18px;
    border-right: 1px solid rgba(15,23,42,.08);
    background: rgba(255,255,255,.60);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 18px 60px rgba(15,23,42,.08);
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
    text-decoration:none;
    color: rgba(15,23,42,.92);
    font-weight: 900;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(15,23,42,.05);
    border: 1px solid rgba(15,23,42,.06);
    transition: transform .15s cubic-bezier(.2,.8,.2,1),
                background .2s cubic-bezier(.2,.8,.2,1),
                filter .2s cubic-bezier(.2,.8,.2,1);
    will-change: transform;
  }
  .menu a:hover{
    background: rgba(15,23,42,.08);
    transform: translateY(-1px);
  }
  .menu a:active{ transform: translateY(0) scale(.99); }

  .menu a.active{
    background: rgba(93,124,255,.14);
    color: #2942b8;
    border-color: rgba(93,124,255,.18);
    box-shadow: 0 16px 40px rgba(93,124,255,.14);
  }

  .inline{ margin: 0; }

  .seed, .logout{
    width: 100%;
    border: 1px solid rgba(15,23,42,.06);
    cursor:pointer;
    padding: 10px 12px;
    border-radius: 14px;
    font-weight: 1000;
    background: rgba(15,23,42,.05);
    text-align:left;
    transition: transform .15s cubic-bezier(.2,.8,.2,1),
                background .2s cubic-bezier(.2,.8,.2,1),
                filter .2s cubic-bezier(.2,.8,.2,1);
    will-change: transform;
  }
  .seed:hover{
    background: rgba(93,124,255,.12);
    transform: translateY(-1px);
  }
  .seed:active{ transform: translateY(0) scale(.99); }

  .logout{
    background: rgba(185,28,28,.10);
    color:#b91c1c;
    border-color: rgba(185,28,28,.14);
  }
  .logout:hover{
    background: rgba(185,28,28,.14);
    transform: translateY(-1px);
  }
  .logout:active{ transform: translateY(0) scale(.99); }

  /* Main */
  .main{ padding: 16px; }

  /* Topbar */
  .topbar{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 18px;
    background: rgba(255,255,255,.70);
    border: 1px solid rgba(15,23,42,.08);
    box-shadow: 0 20px 60px rgba(15,23,42,.08);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  .crumb{
    font-weight: 1000;
    letter-spacing:-0.01em;
    opacity:.9;
  }

  .actions{ display:flex; gap: 10px; align-items:center; flex-wrap:wrap; }

  .ghost{
    text-decoration:none;
    display:inline-flex;
    align-items:center;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(15,23,42,.06);
    color: rgba(15,23,42,.92);
    font-weight: 900;
    border: 1px solid rgba(15,23,42,.06);
    transition: transform .15s cubic-bezier(.2,.8,.2,1),
                background .2s cubic-bezier(.2,.8,.2,1);
    will-change: transform;
  }
  .ghost:hover{
    background: rgba(15,23,42,.09);
    transform: translateY(-1px);
  }
  .ghost:active{ transform: translateY(0) scale(.99); }

  /* Content + page transition container */
  .content{ padding-top: 14px; }
  .page-fade{ will-change: opacity; }
  .page-anim{ will-change: transform; }

  /* Keyboard focus */
  a:focus-visible, button:focus-visible{
    outline: none;
    box-shadow: 0 0 0 4px rgba(93,124,255,.20);
    border-color: rgba(93,124,255,.45);
  }

  @media (max-width: 960px){
    .shell{ grid-template-columns: 1fr; }
    .side{ border-right: 0; border-bottom: 1px solid rgba(15,23,42,.08); }
    .menu{ grid-template-columns: repeat(2, 1fr); }
    .seed, .logout{ text-align:center; }
  }
</style>
