<svelte:head>
  <title>ClientVault — Mini CRM</title>
  <meta name="description" content="ClientVault : mini CRM (prospects & mandats) construit avec SvelteKit + Supabase. Auth, pipeline, notes, tâches, export CSV." />
</svelte:head>

<div class="landing">
  <header class="header">
    <div class="brand">
      <div class="logo">CV</div>
      <div class="title">
        <div class="name">ClientVault</div>
        <div class="tag">Mini CRM • Prospects & Mandats</div>
      </div>
    </div>

    <nav class="nav">
      <a class="ghost" href="/auth">Connexion</a>
      <a class="primary" href="/auth">Démarrer</a>
    </nav>
  </header>

  <main class="hero">
    <div class="hero__left">
      <h1>Un mini CRM propre, rapide et sérieux.</h1>
      <p class="lead">
        Pipeline de prospects, suivi des mandats, notes, tâches avec échéances, dashboard KPI, export CSV.
        Auth + sécurité RLS (chaque utilisateur voit uniquement ses données).
      </p>

      <div class="cta">
        <a class="primary" href="/auth">Se connecter / S’inscrire</a>
        <a class="ghost" href="/auth">Voir le design Login/Register</a>
      </div>

      <div class="chips">
        <span class="chip">SvelteKit</span>
        <span class="chip">Supabase Auth</span>
        <span class="chip">RLS</span>
        <span class="chip">SSR</span>
        <span class="chip">Export CSV</span>
      </div>
    </div>

    <div class="hero__right">
      <div class="glass">
        <div class="glass__top">
          <div class="dot dot--r"></div>
          <div class="dot dot--y"></div>
          <div class="dot dot--g"></div>
          <div class="glass__title">Dashboard Preview</div>
        </div>

        <div class="cards">
          <div class="card">
            <div class="k">Pipeline (ouvert)</div>
            <div class="v">$ 18,100</div>
            <div class="s">Hors gagné / perdu</div>
          </div>
          <div class="card">
            <div class="k">Win rate</div>
            <div class="v">62%</div>
            <div class="bar"><span style="width:62%"></span></div>
          </div>
          <div class="card">
            <div class="k">Tâches</div>
            <div class="v">7</div>
            <div class="pills">
              <span class="pill pill--danger">2 en retard</span>
              <span class="pill pill--warn">1 aujourd’hui</span>
            </div>
          </div>
        </div>

        <div class="miniList">
          <div class="row">
            <div class="left">
              <div class="n">Nordik Studio</div>
              <div class="m">Proposé • $ 7,200</div>
            </div>
            <span class="b b--prop">Proposé</span>
          </div>
          <div class="row">
            <div class="left">
              <div class="n">Logia Inc.</div>
              <div class="m">Qualifié • $ 3,500</div>
            </div>
            <span class="b b--qual">Qualifié</span>
          </div>
          <div class="row">
            <div class="left">
              <div class="n">Atelier Pixel</div>
              <div class="m">Gagné • $ 9,800</div>
            </div>
            <span class="b b--win">Gagné</span>
          </div>
        </div>

        <div class="note">
          <b>Astuce démo :</b> une fois connecté, clique “Charger démo” pour remplir l’app.
        </div>
      </div>
    </div>
  </main>

  <section class="features">
    <div class="feature">
      <h3>Pipeline clair</h3>
      <p>Nouveau → Qualifié → Proposé → Gagné/Perdu. Filtre + recherche.</p>
    </div>
    <div class="feature">
      <h3>Notes & Next steps</h3>
      <p>Historique de suivi par client : décisions, blocages, actions.</p>
    </div>
    <div class="feature">
      <h3>Tâches & échéances</h3>
      <p>Vision “en retard / aujourd’hui” sur le dashboard, pour rester rentable.</p>
    </div>
    <div class="feature">
      <h3>Export CSV</h3>
      <p>Export filtré (Excel-friendly) pour reporting rapide.</p>
    </div>
  </section>

  <footer class="footer">
    <div>ClientVault • construit avec SvelteKit + Supabase</div>
    <div class="footLinks">
      <a href="/auth">Auth</a>
      <a href="/app">App</a>
      <a href="/app/clients">Clients</a>
    </div>
  </footer>
</div>

<style>
  .landing{
    min-height: 100vh;
    padding: 22px 16px 40px;
    background: radial-gradient(1200px 600px at 30% 20%, #ffffff 0%, #eef2ff 45%, #f6f7fb 100%);
  }

  .header{
    max-width: 1140px;
    margin: 0 auto;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap: 14px;
    padding: 14px 14px;
    border-radius: 18px;
    background: rgba(255,255,255,.70);
    border: 1px solid rgba(15,23,42,.08);
    box-shadow: 0 20px 60px rgba(15,23,42,.08);
    backdrop-filter: blur(10px);
  }

  .brand{ display:flex; gap:12px; align-items:center; }
  .logo{
    width: 46px; height: 46px; border-radius: 16px;
    background: linear-gradient(135deg, #6f8bff, #5d7cff);
    color:white; display:grid; place-items:center;
    font-weight: 1000; letter-spacing: -.02em;
    box-shadow: 0 18px 40px rgba(93,124,255,.30);
  }
  .name{ font-weight: 1000; letter-spacing:-0.01em; }
  .tag{ font-size: 12px; opacity:.7; margin-top: 2px; }

  .nav{ display:flex; gap: 10px; flex-wrap:wrap; }

  .hero{
    max-width: 1140px;
    margin: 18px auto 0;
    display:grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 16px;
    align-items: center;
  }
  @media (max-width: 980px){ .hero{ grid-template-columns: 1fr; } }

  h1{
    margin: 0;
    font-size: 46px;
    letter-spacing:-0.03em;
    line-height: 1.02;
  }
  .lead{ margin: 14px 0 0; opacity:.78; font-weight: 600; max-width: 58ch; }

  .cta{ display:flex; gap: 10px; flex-wrap:wrap; margin-top: 18px; }
  .chips{ display:flex; gap: 8px; flex-wrap:wrap; margin-top: 16px; }
  .chip{
    font-size: 12px; font-weight: 900;
    padding: 8px 10px;
    border-radius: 999px;
    background: rgba(15,23,42,.06);
    border: 1px solid rgba(15,23,42,.08);
  }

  .glass{
    border-radius: 22px;
    background: rgba(255,255,255,.65);
    border: 1px solid rgba(15,23,42,.08);
    box-shadow: 0 28px 70px rgba(15,23,42,.12);
    backdrop-filter: blur(10px);
    padding: 14px;
  }
  .glass__top{ display:flex; align-items:center; gap: 8px; padding: 6px 8px 10px; }
  .dot{ width: 10px; height: 10px; border-radius: 999px; opacity:.85; }
  .dot--r{ background: #ef4444; } .dot--y{ background: #f59e0b; } .dot--g{ background: #22c55e; }
  .glass__title{ margin-left: 6px; font-weight: 1000; opacity:.75; font-size: 12px; }

  .cards{ display:grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
  @media (max-width: 520px){ .cards{ grid-template-columns: 1fr; } }
  .card{
    padding: 12px;
    border-radius: 16px;
    background: rgba(255,255,255,.75);
    border: 1px solid rgba(15,23,42,.08);
  }
  .k{ font-size: 12px; opacity:.7; font-weight: 900; }
  .v{ font-size: 22px; font-weight: 1000; margin-top: 8px; }
  .s{ font-size: 12px; opacity:.7; margin-top: 4px; }
  .bar{ height: 10px; border-radius: 999px; background: rgba(15,23,42,.06); overflow:hidden; margin-top: 10px; }
  .bar span{ display:block; height:100%; background: rgba(93,124,255,.9); }
  .pills{ display:flex; gap: 8px; flex-wrap:wrap; margin-top: 10px; }
  .pill{ font-size: 12px; font-weight: 1000; padding: 6px 10px; border-radius: 999px; border: 1px solid rgba(15,23,42,.10); }
  .pill--danger{ background: rgba(239,68,68,0.10); color:#991b1b; }
  .pill--warn{ background: rgba(245,158,11,0.12); color:#92400e; }

  .miniList{ margin-top: 10px; display:grid; gap: 10px; }
  .row{
    display:flex; justify-content:space-between; gap: 10px; align-items:center;
    padding: 12px;
    border-radius: 16px;
    background: rgba(255,255,255,.70);
    border: 1px solid rgba(15,23,42,.08);
  }
  .n{ font-weight: 1000; }
  .m{ font-size: 12px; opacity:.75; margin-top: 2px; }

  .b{ font-size: 12px; padding: 6px 10px; border-radius: 999px; font-weight: 1000; border: 1px solid rgba(15,23,42,0.10); }
  .b--qual { background: rgba(16,185,129,0.10); color: #065f46; }
  .b--prop { background: rgba(245,158,11,0.12); color: #92400e; }
  .b--win  { background: rgba(34,197,94,0.12); color: #166534; }

  .note{
    margin-top: 12px;
    padding: 12px;
    border-radius: 16px;
    background: rgba(93,124,255,.10);
    border: 1px solid rgba(93,124,255,.16);
    font-weight: 800;
    opacity:.9;
  }

  .features{
    max-width: 1140px;
    margin: 16px auto 0;
    display:grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  @media (max-width: 980px){ .features{ grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 520px){ .features{ grid-template-columns: 1fr; } }
  .feature{
    padding: 16px;
    border-radius: 18px;
    background: rgba(255,255,255,.70);
    border: 1px solid rgba(15,23,42,.08);
    box-shadow: 0 20px 60px rgba(15,23,42,.08);
  }
  .feature h3{ margin:0; font-weight: 1000; letter-spacing:-0.01em; }
  .feature p{ margin: 8px 0 0; opacity:.75; font-weight: 600; }

  .footer{
    max-width: 1140px;
    margin: 18px auto 0;
    display:flex;
    justify-content:space-between;
    gap: 12px;
    flex-wrap:wrap;
    padding: 14px 10px;
    opacity:.75;
    font-weight: 700;
  }
  .footLinks{ display:flex; gap: 12px; }
  .footLinks a{ color: inherit; text-decoration:none; }
  .footLinks a:hover{ text-decoration:underline; }

  .primary, .ghost{
    text-decoration:none;
    display:inline-flex; align-items:center; justify-content:center;
    padding: 11px 14px;
    border-radius: 14px;
    font-weight: 1000;
    transition: transform .15s ease, filter .2s ease, background .2s ease;
  }
  .primary{
    background:#5d7cff; color:#fff;
    box-shadow:0 14px 30px rgba(93,124,255,.25);
  }
  .primary:hover{ filter:brightness(1.02); }
  .ghost{
    background: rgba(15,23,42,.06);
    color: rgba(15,23,42,.92);
  }
  .ghost:hover{ background: rgba(15,23,42,.09); }
  .primary:active, .ghost:active{ transform: translateY(1px) scale(.99); }
</style>
