<script lang="ts">
  import { page } from '$app/state';
  import { browser } from '$app/environment';
  import { replaceState } from '$app/navigation';
  import { toast } from '$lib/stores/toast';
  import ToastHost from '$lib/components/ToastHost.svelte';
  import type { TransitionConfig } from 'svelte/transition';

  let { data, children } = $props<{
    data: { user: { email?: string | null } };
    children: any;
  }>();

  const crumb = (pathname: string) => {
    if (pathname === '/app') return 'Dashboard';
    if (pathname.startsWith('/app/clients')) return 'Clients';
    return 'App';
  };

  const fadeSlide = (node: Element, opts?: { y?: number; duration?: number }): TransitionConfig => {
    const y = opts?.y ?? 10;
    const duration = opts?.duration ?? 220;

    const style = getComputedStyle(node);
    const baseOpacity = Number(style.opacity) || 1;

    return {
      duration,
      css: (t) => {
        const inv = 1 - t;
        return `
          opacity: ${t * baseOpacity};
          transform: translateY(${inv * y}px);
          filter: blur(${inv * 1.2}px);
        `;
      }
    };
  };

  $effect(() => {
    if (!browser) return;

    const msg = page.url.searchParams.get('toast');
    const type = page.url.searchParams.get('type') ?? 'success';
    if (!msg) return;

    if (type === 'error') toast.error(msg);
    else if (type === 'info') toast.info(msg);
    else toast.success(msg);

    const u = new URL(page.url);
    u.searchParams.delete('toast');
    u.searchParams.delete('type');

    replaceState(u, {});
  });
</script>

<ToastHost />

<div class="shell">
  <aside class="side">
    <div class="brand">
      <div class="logo" aria-hidden="true">CV</div>
      <div class="brand__meta">
        <div class="name">ClientVault</div>
        <div class="mail">{data.user.email ?? '—'}</div>
      </div>
    </div>

    <nav class="menu" aria-label="Navigation">
      <a class:active={page.url.pathname === '/app'} href="/app">
        <span class="dot" aria-hidden="true"></span>
        Dashboard
      </a>

      <a class:active={page.url.pathname.startsWith('/app/clients')} href="/app/clients">
        <span class="dot" aria-hidden="true"></span>
        Clients
      </a>

      <div class="divider"></div>

      <form method="POST" action="/app/logout" class="inline">
        <button class="logout" type="submit">Logout</button>
      </form>
    </nav>
  </aside>

  <main class="main">
    <header class="topbar">
      <div class="crumb">{crumb(page.url.pathname)}</div>

      <div class="actions">
        <a class="ghost" href="/app/clients">+ Ajouter un client</a>
       <a class="ghost" href="/app/clients/export" data-sveltekit-reload>
  Export CSV
</a>

      </div>
    </header>

    <div class="content">
      {#key page.url.pathname}
        <div class="pageWrap" transition:fadeSlide={{ y: 10, duration: 240 }}>
          {@render children()}
        </div>
      {/key}
    </div>
  </main>
</div>

<style>
  .shell{
    min-height: 100vh;
    display:grid;
    grid-template-columns: 280px 1fr;
    background:
      radial-gradient(1200px 600px at 30% 20%, #ffffff 0%, #eef2ff 45%, #f6f7fb 100%);
  }

  .side{
    padding: 18px;
    border-right: 1px solid rgba(15,23,42,.08);
    background: rgba(255,255,255,.62);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    position: sticky;
    top: 0;
    height: 100vh;
  }

  .brand{
    display:flex;
    gap:12px;
    align-items:center;
    padding: 8px 8px 16px;
  }

  .logo{
    width: 48px; height: 48px; border-radius: 18px;
    background: linear-gradient(135deg, #6f8bff, #5d7cff);
    color:white; display:grid; place-items:center;
    font-weight: 1000; letter-spacing: -.02em;
    box-shadow: 0 18px 40px rgba(93,124,255,.30);
    transition: transform .2s ease, box-shadow .2s ease;
  }

  .brand:hover .logo{
    transform: translateY(-1px);
    box-shadow: 0 26px 60px rgba(93,124,255,.34);
  }

  .name{ font-weight: 1000; letter-spacing:-0.01em; }
  .mail{ font-size: 12px; opacity:.7; margin-top: 2px; }

  .brand__meta{ display:grid; gap: 2px; }

  .menu{ display:grid; gap: 10px; padding: 6px 8px; }

  .menu a{
    text-decoration:none;
    color: rgba(15,23,42,.92);
    font-weight: 950;
    padding: 11px 12px;
    border-radius: 16px;
    background: rgba(15,23,42,.05);
    display:flex;
    align-items:center;
    gap: 10px;
    transition: transform .16s ease, background .2s ease, box-shadow .2s ease;
    position: relative;
  }

  .menu a:hover{
    background: rgba(15,23,42,.08);
    transform: translateY(-1px);
    box-shadow: 0 18px 40px rgba(15,23,42,.06);
  }

  .menu a.active{
    background: rgba(93,124,255,.14);
    color: #2942b8;
    box-shadow: 0 18px 45px rgba(93,124,255,.14);
  }

  .dot{
    width: 8px; height: 8px;
    border-radius: 999px;
    background: rgba(15,23,42,.25);
  }

  .menu a.active .dot{
    background: rgba(93,124,255,1);
    box-shadow: 0 0 0 5px rgba(93,124,255,.14);
  }

  .divider{
    height: 1px;
    background: rgba(15,23,42,.08);
    margin: 6px 2px;
  }

  .inline{ margin: 0; }

  .seed, .logout{
    width: 100%;
    border:0; cursor:pointer;
    padding: 11px 12px;
    border-radius: 16px;
    font-weight: 950;
    background: rgba(15,23,42,.05);
    text-align:left;
    transition: transform .16s ease, background .2s ease, box-shadow .2s ease;
  }

  .seed:hover{
    background: rgba(93,124,255,.12);
    transform: translateY(-1px);
    box-shadow: 0 18px 40px rgba(93,124,255,.12);
  }

  .logout{
    background: rgba(185,28,28,.10);
    color:#b91c1c;
  }

  .logout:hover{
    background: rgba(185,28,28,.14);
    transform: translateY(-1px);
    box-shadow: 0 18px 40px rgba(185,28,28,.10);
  }

  .main{ padding: 16px; }

  .topbar{
    display:flex; justify-content:space-between; align-items:center; gap: 12px;
    padding: 14px 16px;
    border-radius: 18px;
    background: rgba(255,255,255,.72);
    border: 1px solid rgba(15,23,42,.08);
    box-shadow: 0 20px 60px rgba(15,23,42,.08);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    position: sticky;
    top: 12px;
    z-index: 5;
  }

  .crumb{
    font-weight: 1000;
    letter-spacing:-0.01em;
    opacity:.9;
  }

  .actions{ display:flex; gap: 10px; align-items:center; flex-wrap:wrap; }

  .ghost{
    text-decoration:none;
    display:inline-flex; align-items:center;
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(15,23,42,.06);
    color: rgba(15,23,42,.92);
    font-weight: 950;
    transition: transform .16s ease, background .2s ease, box-shadow .2s ease;
  }

  .ghost:hover{
    background: rgba(15,23,42,.09);
    transform: translateY(-1px);
    box-shadow: 0 18px 40px rgba(15,23,42,.06);
  }

  .content{ padding-top: 14px; }

  .pageWrap{
    border-radius: 18px;
    min-height: calc(100vh - 120px);
  }

  @media (max-width: 960px){
    .shell{ grid-template-columns: 1fr; }
    .side{
      position: relative;
      height: auto;
      border-right: 0;
      border-bottom: 1px solid rgba(15,23,42,.08);
    }
    .menu{ grid-template-columns: repeat(2, 1fr); }
    .seed, .logout{ text-align:center; }
    .topbar{ position: relative; top: 0; }
    .pageWrap{ min-height: auto; }
  }

  @media (prefers-reduced-motion: reduce){
    .logo, .menu a, .seed, .logout, .ghost{
      transition: none !important;
    }
  }
</style>
