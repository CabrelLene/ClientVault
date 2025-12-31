<!-- src/routes/+page.svelte -->
<script lang="ts">
  const year = new Date().getFullYear();

  const bullets = [
    { t: 'Pipeline lisible en 10 secondes', d: 'Tu vois l’essentiel : valeur, statut, priorités.' },
    { t: 'Suivi réel (clients + tâches)', d: 'Relances, devis, appels. Échéances visibles.' },
    { t: 'Export CSV fiable', d: 'Téléchargement direct, compat Excel, données propres.' },
    { t: 'Sécurité par défaut', d: 'Auth + RLS Supabase. Isolation stricte par user.' }
  ] as const;

  const pillars = [
    {
      k: 'Clarté',
      title: 'Une interface qui réduit le bruit.',
      desc: 'Moins de clics. Moins de doute. Plus d’actions qui comptent.'
    },
    {
      k: 'Vitesse',
      title: 'Un CRM qui suit ton rythme.',
      desc: 'Chargements nets, interactions fluides, pas de lourdeur.'
    },
    {
      k: 'Fiabilité',
      title: 'Conçu pour la prod, pas pour faire joli.',
      desc: 'Tu peux l’utiliser avec de vrais clients sans stress.'
    }
  ] as const;

  const steps = [
    { n: '01', t: 'Ajoute un client', d: 'Nom, entreprise, statut, valeur. Terminé.' },
    { n: '02', t: 'Qualifie et avance', d: 'Le pipeline te donne la trajectoire.' },
    { n: '03', t: 'Planifie les relances', d: 'Tâches + échéances = suivi solide.' },
    { n: '04', t: 'Export & reporting', d: 'CSV propre, exploitable immédiatement.' }
  ] as const;
</script>

<main class="page">
  <!-- Background / Atmosphere -->
  <div class="atmo" aria-hidden="true">
    <div class="noise"></div>
    <div class="halo h1"></div>
    <div class="halo h2"></div>
    <div class="mesh"></div>
    <div class="scan"></div>
  </div>

  <!-- Topbar -->
  <header class="top">
    <a class="brand" href="/" aria-label="ClientVault">
      <span class="mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" class="svg">
          <path
            d="M20 3l14 7v10c0 9-6.2 15.7-14 17C12.2 35.7 6 29 6 20V10l14-7Z"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linejoin="round"
          />
          <path
            d="M14 20l4 4 9-10"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <span class="btxt">
        <span class="bname">ClientVault</span>
        <span class="btag">CRM moderne — focus pipeline & suivi</span>
      </span>
    </a>

    <nav class="nav" aria-label="Navigation">
      <a class="nlink" href="#product">Produit</a>
      <a class="nlink" href="#workflow">Méthode</a>
      <a class="nlink" href="#security">Sécurité</a>

      <div class="cta">
        <a class="ghost" href="/auth">Se connecter</a>
        <a class="btn" href="/auth">
          Démarrer
          <span class="arr" aria-hidden="true">→</span>
        </a>
      </div>
    </nav>
  </header>

  <!-- Hero -->
  <section class="hero">
    <div class="left">
      <div class="chips">
        <span class="chip">
          <span class="dot"></span> Production-ready
        </span>
        <span class="chip chip--soft">Supabase • Auth + RLS</span>
        <span class="chip chip--soft">SvelteKit • Vercel</span>
      </div>

      <h1>
        Pilote ton pipeline.
        <span class="accent">Pas ton stress.</span>
      </h1>

      <p class="lead">
        ClientVault est un CRM minimaliste, premium et efficace :
        une vision claire des clients, des tâches et des opportunités — sans usine à gaz.
      </p>

      <div class="heroCta">
        <a class="btn btn--xl" href="/auth">
          <span class="ico" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="svg">
              <path
                d="M12 5v14M5 12h14"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </span>
          Accéder à l’app
        </a>

        <a class="ghost ghost--xl" href="#product">
          Voir le produit
          <span class="arr" aria-hidden="true">↘</span>
        </a>
      </div>

      <div class="proof">
        <div class="proofLeft">
          <div class="stars" aria-hidden="true">★★★★★</div>
          <div class="proofText">
            <div class="p1">Pensé pour la prod.</div>
            <div class="p2">Simple, sûr, et prêt à scaler.</div>
          </div>
        </div>

        <div class="proofRight">
          <div class="stat">
            <div class="k">Mise en place</div>
            <div class="v">~ 5 min</div>
          </div>
          <div class="stat">
            <div class="k">Données</div>
            <div class="v">isolées</div>
          </div>
          <div class="stat">
            <div class="k">Export</div>
            <div class="v">CSV pro</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hero visual (original, pas “démo IA”) -->
    <div class="right" aria-hidden="true">
      <div class="frame">
        <div class="frameTop">
          <div class="lights">
            <span class="l r"></span><span class="l y"></span><span class="l g"></span>
          </div>
          <div class="ftitle">ClientVault</div>
          <div class="badge">Live</div>
        </div>

        <div class="frameBody">
          <div class="kpis">
            <div class="kpi">
              <div class="k">Pipeline</div>
              <div class="v">$35 500</div>
              <div class="s">Ouvert</div>
            </div>
            <div class="kpi kpi--good">
              <div class="k">Gagné</div>
              <div class="v">$24 000</div>
              <div class="s">Revenue</div>
            </div>
            <div class="kpi kpi--hot">
              <div class="k">Win rate</div>
              <div class="v">42%</div>
              <div class="s">Conversion</div>
            </div>
          </div>

          <div class="panel">
            <div class="ph">
              <div class="pt">Pipeline par statut</div>
              <span class="pill">Auto</span>
            </div>
            <div class="bars">
              <span style="height: 34%"></span>
              <span style="height: 60%"></span>
              <span style="height: 78%"></span>
              <span style="height: 88%"></span>
              <span style="height: 24%"></span>
            </div>
          </div>

          <div class="panel">
            <div class="ph">
              <div class="pt">Actions du jour</div>
              <span class="pill pill--soft">3</span>
            </div>
            <div class="rows">
              <div class="row"><span class="rk"></span><span class="rv"></span></div>
              <div class="row"><span class="rk"></span><span class="rv"></span></div>
              <div class="row"><span class="rk"></span><span class="rv"></span></div>
            </div>
          </div>
        </div>

        <div class="edgeGlow"></div>
      </div>
    </div>
  </section>

  <!-- Product -->
  <section id="product" class="section">
    <header class="secHead">
      <div class="eyebrow">Produit</div>
      <h2>Un CRM qui se comporte comme un produit haut de gamme.</h2>
      <p>
        Le design ne sert pas à faire joli : il sert à t’aider à décider vite, à exécuter propre,
        et à suivre sans oublier.
      </p>
    </header>

    <div class="grid4">
      {#each bullets as b (b.t)}
        <article class="card">
          <div class="ic">
            <svg viewBox="0 0 24 24" class="svg">
              <path
                d="M9 12l2 2 4-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M7 21h10a2 2 0 0 0 2-2V7l-4-4H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <h3>{b.t}</h3>
          <p>{b.d}</p>
        </article>
      {/each}
    </div>

    <div class="pillars">
      {#each pillars as p (p.k)}
        <article class="pillar">
          <div class="pk">{p.k}</div>
          <div class="pt">{p.title}</div>
          <div class="pd">{p.desc}</div>
        </article>
      {/each}
    </div>
  </section>

  <!-- Workflow -->
  <section id="workflow" class="section">
    <header class="secHead">
      <div class="eyebrow">Méthode</div>
      <h2>De “je note quelque part” à “je maîtrise”.</h2>
      <p>Un flow simple, mais discipliné. C’est ça qui scale.</p>
    </header>

    <div class="steps">
      {#each steps as s (s.n)}
        <article class="step">
          <div class="sn">{s.n}</div>
          <div class="st">{s.t}</div>
          <div class="sd">{s.d}</div>
        </article>
      {/each}
    </div>
  </section>

  <!-- Security -->
  <section id="security" class="section">
    <header class="secHead">
      <div class="eyebrow">Sécurité</div>
      <h2>Sérieux. Sans drama.</h2>
      <p>Tu ne mets pas un CRM en prod si tes données peuvent se mélanger. Ici, non.</p>
    </header>

    <div class="secGrid">
      <article class="sCard">
        <div class="sTop">
          <span class="sIco">🛡️</span>
          <span class="sTitle">RLS Supabase</span>
        </div>
        <p class="sDesc">Les tables sont scoppées par utilisateur. Pas d’accès croisé.</p>
      </article>

      <article class="sCard">
        <div class="sTop">
          <span class="sIco">🔐</span>
          <span class="sTitle">Auth server-side</span>
        </div>
        <p class="sDesc">Vérification côté serveur via cookies SSR. Plus robuste.</p>
      </article>

      <article class="sCard">
        <div class="sTop">
          <span class="sIco">📎</span>
          <span class="sTitle">Export contrôlé</span>
        </div>
        <p class="sDesc">CSV généré côté serveur, headers “attachment”, Excel-ready.</p>
      </article>
    </div>

    <div class="ctaBlock">
      <div class="ctL">
        <div class="ctT">Prêt à passer en prod avec de vrais clients ?</div>
        <div class="ctS">Connecte-toi et commence. Zéro démo, que du réel.</div>
      </div>
      <div class="ctR">
        <a class="btn btn--xl" href="/auth">Se connecter</a>
        <a class="ghost ghost--xl" href="/auth">Créer un compte</a>
      </div>
    </div>
  </section>

  <footer class="foot">
    <div class="fl">
      <span class="miniMark" aria-hidden="true">CV</span>
      <span class="fBrand">ClientVault</span>
      <span class="sep">•</span>
      <span class="fMuted">© {year}</span>
    </div>
    <div class="fr">
      <a class="nlink" href="/auth">Accéder</a>
      <a class="nlink" href="#product">Produit</a>
      <a class="nlink" href="#security">Sécurité</a>
    </div>
  </footer>
</main>

<style>
  /* ---------- Palette (originale, pas “bleu-violet IA”) ---------- */
  :global(:root){
    --bg0: #070A12;         /* obsidienne */
    --bg1: #0B1020;         /* nuit */
    --panel: rgba(255,255,255,.06);
    --panel2: rgba(255,255,255,.08);
    --line: rgba(255,255,255,.10);
    --ink: rgba(255,255,255,.92);
    --muted: rgba(255,255,255,.70);

    --euca: #2EE6A6;        /* eucalyptus (accent principal) */
    --saff: #F2B544;        /* safran (accent secondaire) */
    --rose: #FF5A7A;        /* punch discret */
    --ice:  #9BB3FF;        /* highlight froid (rare) */

    --shadow: 0 28px 90px rgba(0,0,0,.55);
    --shadow2: 0 18px 60px rgba(0,0,0,.40);
    --r: 22px;
  }

  :global(body){
    margin: 0;
    color: var(--ink);
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Inter, Roboto, Arial;
    background: radial-gradient(1200px 600px at 15% 10%, #0E1630 0%, var(--bg0) 55%, #05070E 100%);
  }

  .svg{ width: 18px; height: 18px; display:block; }

  .page{
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    padding: 22px;
  }

  /* ---------- Atmosphere ---------- */
  .atmo{ position:absolute; inset:0; pointer-events:none; z-index:0; }
  .noise{
    position:absolute; inset:-20%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='.25'/%3E%3C/svg%3E");
    opacity: .08;
    transform: rotate(2deg);
  }
  .halo{
    position:absolute;
    width: 780px; height: 780px; border-radius: 999px;
    filter: blur(55px);
    opacity: .26;
  }
  .h1{
    left: -320px; top: -360px;
    background:
      radial-gradient(circle at 35% 35%, rgba(46,230,166,.85), transparent 58%),
      radial-gradient(circle at 70% 60%, rgba(242,181,68,.55), transparent 60%);
    animation: drift1 12s ease-in-out infinite;
  }
  .h2{
    right: -340px; bottom: -380px;
    background:
      radial-gradient(circle at 35% 35%, rgba(255,90,122,.55), transparent 58%),
      radial-gradient(circle at 70% 60%, rgba(155,179,255,.45), transparent 62%);
    animation: drift2 14s ease-in-out infinite;
  }
  .mesh{
    position:absolute; inset:0;
    background:
      linear-gradient(to right, rgba(255,255,255,.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,.06) 1px, transparent 1px);
    background-size: 76px 76px;
    opacity: .14;
    mask-image: radial-gradient(circle at 30% 20%, black, transparent 65%);
  }
  .scan{
    position:absolute; inset:-40%;
    background: radial-gradient(circle at 28% 18%, rgba(255,255,255,.18), transparent 55%);
    opacity: .22;
  }
  @keyframes drift1{
    0%,100%{ transform: translate(0,0) scale(1); }
    50%{ transform: translate(40px, 20px) scale(1.03); }
  }
  @keyframes drift2{
    0%,100%{ transform: translate(0,0) scale(1); }
    50%{ transform: translate(-36px, -22px) scale(1.03); }
  }

  /* ---------- Topbar ---------- */
  .top{
    position: relative;
    z-index: 2;
    max-width: 1180px;
    margin: 0 auto;
    display:flex;
    justify-content: space-between;
    align-items:center;
    gap: 12px;
    padding: 10px 6px 18px;
  }

  .brand{
    display:flex; gap: 12px; align-items:center;
    color: inherit; text-decoration:none;
  }
  .mark{
    width: 46px; height: 46px;
    border-radius: 18px;
    display:grid; place-items:center;
    background: linear-gradient(145deg, rgba(255,255,255,.10), rgba(255,255,255,.05));
    border: 1px solid rgba(255,255,255,.12);
    box-shadow: var(--shadow2);
    color: rgba(255,255,255,.92);
  }
  .btxt{ display:grid; gap: 2px; }
  .bname{ font-weight: 1000; letter-spacing: -.02em; }
  .btag{ font-size: 12px; opacity: .72; font-weight: 900; }

  .nav{ display:flex; gap: 10px; align-items:center; flex-wrap:wrap; justify-content:flex-end; }
  .nlink{
    color: rgba(255,255,255,.84);
    text-decoration:none;
    font-weight: 950;
    padding: 10px 12px;
    border-radius: 14px;
    transition: background .2s ease, transform .15s ease, opacity .2s ease;
  }
  .nlink:hover{
    background: rgba(255,255,255,.06);
    transform: translateY(-1px);
    opacity: 1;
  }
  .cta{ display:flex; gap: 10px; align-items:center; }

  /* Buttons */
  .btn, .ghost{
    display:inline-flex; align-items:center; justify-content:center; gap: 10px;
    border-radius: 16px;
    padding: 10px 12px;
    font-weight: 1000;
    text-decoration:none;
    border: 1px solid rgba(255,255,255,.12);
    transition: transform .16s ease, box-shadow .2s ease, background .2s ease, border-color .2s ease;
    white-space: nowrap;
  }
  .btn{
    color: #081015;
    background: linear-gradient(135deg, rgba(46,230,166,1), rgba(242,181,68,.95));
    border-color: rgba(46,230,166,.35);
    box-shadow: 0 26px 90px rgba(46,230,166,.18);
  }
  .btn:hover{ transform: translateY(-1px); box-shadow: 0 34px 120px rgba(46,230,166,.22); }

  .ghost{
    color: rgba(255,255,255,.90);
    background: rgba(255,255,255,.06);
    border-color: rgba(255,255,255,.12);
  }
  .ghost:hover{
    transform: translateY(-1px);
    background: rgba(255,255,255,.09);
    box-shadow: 0 18px 70px rgba(0,0,0,.35);
  }

  .btn--xl, .ghost--xl{ padding: 12px 14px; border-radius: 18px; }
  .arr{ opacity: .9; font-weight: 1200; }

  /* ---------- Hero ---------- */
  .hero{
    position: relative;
    z-index: 2;
    max-width: 1180px;
    margin: 0 auto;
    display:grid;
    grid-template-columns: 1.05fr .95fr;
    gap: 18px;
    align-items:center;
    padding: 8px 6px 18px;
  }

  .chips{ display:flex; gap: 10px; flex-wrap:wrap; align-items:center; }
  .chip{
    display:inline-flex; align-items:center; gap: 10px;
    padding: 9px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.12);
    color: rgba(255,255,255,.86);
    font-weight: 950;
    box-shadow: 0 16px 60px rgba(0,0,0,.28);
  }
  .chip--soft{
    background: rgba(255,255,255,.04);
    box-shadow: none;
    color: rgba(255,255,255,.78);
  }
  .dot{
    width: 10px; height: 10px; border-radius: 999px;
    background: var(--euca);
    box-shadow: 0 0 0 6px rgba(46,230,166,.18);
    animation: pulse 1.1s ease-in-out infinite;
  }
  @keyframes pulse{ 0%,100%{ transform: scale(1); } 50%{ transform: scale(1.08); } }

  h1{
    margin: 14px 0 0;
    font-size: clamp(34px, 4.4vw, 58px);
    line-height: 1.02;
    letter-spacing: -.05em;
    font-weight: 1100;
  }
  .accent{
    background: linear-gradient(90deg, rgba(46,230,166,1), rgba(242,181,68,1));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .lead{
    margin: 12px 0 0;
    font-size: 15px;
    line-height: 1.7;
    color: var(--muted);
    max-width: 70ch;
  }

  .heroCta{ margin-top: 16px; display:flex; gap: 10px; flex-wrap:wrap; align-items:center; }

  .proof{
    margin-top: 16px;
    display:flex;
    gap: 12px;
    flex-wrap:wrap;
    align-items:center;
    justify-content:space-between;
    padding: 14px;
    border-radius: 24px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.12);
    box-shadow: var(--shadow2);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
  .proofLeft{ display:flex; gap: 12px; align-items:center; }
  .stars{ letter-spacing: .14em; color: rgba(242,181,68,.95); font-weight: 1000; }
  .proofText{ display:grid; gap: 2px; }
  .p1{ font-weight: 1100; }
  .p2{ font-size: 12px; opacity:.78; font-weight: 900; }

  .proofRight{ display:flex; gap: 14px; flex-wrap:wrap; justify-content:flex-end; }
  .stat{
    padding: 10px 12px;
    border-radius: 18px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.10);
  }
  .k{ font-size: 12px; opacity:.72; font-weight: 950; }
  .v{ margin-top: 6px; font-weight: 1100; letter-spacing:-.01em; }

  /* ---------- Hero Frame ---------- */
  .frame{
    position: relative;
    border-radius: 28px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.12);
    box-shadow: 0 55px 160px rgba(0,0,0,.65);
    overflow:hidden;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .frameTop{
    display:flex; align-items:center; justify-content:space-between;
    padding: 12px 14px;
    background: rgba(255,255,255,.05);
    border-bottom: 1px solid rgba(255,255,255,.10);
  }
  .lights{ display:flex; gap: 7px; }
  .l{ width: 10px; height: 10px; border-radius: 999px; background: rgba(255,255,255,.18); }
  .l.r{ background: rgba(255,90,122,.70); }
  .l.y{ background: rgba(242,181,68,.70); }
  .l.g{ background: rgba(46,230,166,.70); }

  .ftitle{ font-weight: 1000; opacity:.90; letter-spacing:-.01em; }
  .badge{
    font-size: 12px;
    padding: 7px 10px;
    border-radius: 999px;
    background: rgba(46,230,166,.14);
    border: 1px solid rgba(46,230,166,.26);
    color: rgba(46,230,166,.95);
    font-weight: 1000;
  }

  .frameBody{ padding: 14px; display:grid; gap: 12px; }
  .kpis{ display:grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; }
  .kpi{
    border-radius: 20px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.10);
    padding: 12px;
  }
  .kpi .v{ font-size: 18px; }
  .kpi .s{ margin-top: 6px; font-size: 12px; opacity:.75; font-weight: 900; color: rgba(255,255,255,.78); }
  .kpi--good{
    background: rgba(46,230,166,.08);
    border-color: rgba(46,230,166,.22);
  }
  .kpi--hot{
    background: rgba(242,181,68,.10);
    border-color: rgba(242,181,68,.22);
  }

  .panel{
    border-radius: 22px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.10);
    padding: 12px;
  }
  .ph{ display:flex; justify-content:space-between; align-items:center; gap: 10px; }
  .pt{ font-weight: 1000; opacity:.90; }
  .pill{
    padding: 7px 10px;
    border-radius: 999px;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.10);
    font-weight: 1000;
    font-size: 12px;
    color: rgba(255,255,255,.82);
  }
  .pill--soft{
    background: rgba(255,255,255,.04);
    color: rgba(255,255,255,.75);
  }

  .bars{
    margin-top: 12px;
    height: 120px;
    display:flex;
    gap: 10px;
    align-items:flex-end;
  }
  .bars span{
    flex: 1;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(46,230,166,.92), rgba(46,230,166,.18));
    box-shadow: 0 18px 60px rgba(46,230,166,.12);
  }
  .bars span:nth-child(2){ background: linear-gradient(180deg, rgba(242,181,68,.92), rgba(242,181,68,.18)); }
  .bars span:nth-child(3){ background: linear-gradient(180deg, rgba(155,179,255,.85), rgba(155,179,255,.18)); }
  .bars span:nth-child(4){ background: linear-gradient(180deg, rgba(46,230,166,.75), rgba(46,230,166,.14)); }
  .bars span:nth-child(5){ background: linear-gradient(180deg, rgba(255,90,122,.70), rgba(255,90,122,.14)); }

  .rows{ margin-top: 10px; display:grid; gap: 10px; }
  .row{
    display:flex; justify-content:space-between; gap: 10px; align-items:center;
    padding: 10px;
    border-radius: 16px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.08);
  }
  .rk, .rv{
    height: 10px; border-radius: 999px;
    background: rgba(255,255,255,.10);
  }
  .rk{ width: 58%; }
  .rv{ width: 24%; }

  .edgeGlow{
    position:absolute; inset:-40%;
    background: radial-gradient(circle at 30% 20%, rgba(46,230,166,.18), transparent 58%);
    pointer-events:none;
  }

  /* ---------- Sections ---------- */
  .section{
    position: relative;
    z-index: 2;
    max-width: 1180px;
    margin: 0 auto;
    padding: 18px 6px 10px;
  }
  .secHead{ display:grid; gap: 6px; padding: 8px 0 14px; }
  .eyebrow{
    font-size: 12px;
    letter-spacing: .14em;
    text-transform: uppercase;
    opacity: .72;
    font-weight: 1000;
  }
  h2{
    margin: 0;
    font-size: 26px;
    letter-spacing: -.02em;
    font-weight: 1100;
  }
  .secHead p{
    margin: 0;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.7;
    max-width: 76ch;
  }

  .grid4{
    display:grid;
    grid-template-columns: repeat(4, minmax(0,1fr));
    gap: 12px;
  }
  .card{
    border-radius: 24px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.12);
    box-shadow: var(--shadow2);
    padding: 14px;
    transition: transform .18s ease, box-shadow .2s ease, border-color .2s ease;
  }
  .card:hover{
    transform: translateY(-2px);
    border-color: rgba(46,230,166,.25);
    box-shadow: 0 34px 120px rgba(0,0,0,.55);
  }
  .ic{
    width: 44px; height: 44px;
    border-radius: 18px;
    display:grid; place-items:center;
    background: rgba(46,230,166,.10);
    border: 1px solid rgba(46,230,166,.22);
    color: rgba(46,230,166,.95);
  }
  .card h3{
    margin: 12px 0 0;
    font-size: 14px;
    font-weight: 1100;
    letter-spacing:-.01em;
  }
  .card p{
    margin: 8px 0 0;
    font-size: 12px;
    color: var(--muted);
    line-height: 1.6;
  }

  .pillars{
    margin-top: 12px;
    display:grid;
    grid-template-columns: repeat(3, minmax(0,1fr));
    gap: 12px;
  }
  .pillar{
    border-radius: 24px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.10);
    padding: 14px;
  }
  .pk{
    display:inline-flex;
    padding: 7px 10px;
    border-radius: 999px;
    background: rgba(242,181,68,.10);
    border: 1px solid rgba(242,181,68,.22);
    color: rgba(242,181,68,.95);
    font-weight: 1100;
    font-size: 12px;
    width: fit-content;
  }
  .pillar .pt{ margin-top: 10px; }
  .pillar .pd{ margin-top: 6px; font-size: 12px; color: var(--muted); line-height: 1.6; }

  .steps{
    display:grid;
    grid-template-columns: repeat(4, minmax(0,1fr));
    gap: 12px;
  }
  .step{
    border-radius: 24px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.10);
    padding: 14px;
  }
  .sn{
    font-weight: 1100;
    letter-spacing: .12em;
    opacity: .80;
  }
  .st{ margin-top: 10px; font-weight: 1100; letter-spacing:-.01em; }
  .sd{ margin-top: 6px; font-size: 12px; color: var(--muted); line-height: 1.6; }

  .secGrid{
    display:grid;
    grid-template-columns: repeat(3, minmax(0,1fr));
    gap: 12px;
  }
  .sCard{
    border-radius: 24px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.12);
    box-shadow: var(--shadow2);
    padding: 14px;
  }
  .sTop{ display:flex; gap: 10px; align-items:center; }
  .sIco{
    width: 40px; height: 40px;
    border-radius: 16px;
    display:grid; place-items:center;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.10);
  }
  .sTitle{ font-weight: 1100; }
  .sDesc{ margin: 10px 0 0; font-size: 12px; color: var(--muted); line-height: 1.6; }

  .ctaBlock{
    margin-top: 12px;
    border-radius: 28px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.12);
    box-shadow: var(--shadow);
    padding: 16px;
    display:flex;
    justify-content: space-between;
    align-items:center;
    gap: 12px;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .ctT{ font-weight: 1100; font-size: 16px; letter-spacing:-.01em; }
  .ctS{ margin-top: 6px; color: var(--muted); font-size: 12px; }
  .ctR{ display:flex; gap: 10px; flex-wrap:wrap; }

  /* ---------- Footer ---------- */
  .foot{
    position: relative;
    z-index: 2;
    max-width: 1180px;
    margin: 0 auto;
    padding: 18px 6px 10px;
    display:flex;
    justify-content: space-between;
    align-items:center;
    gap: 10px;
    opacity: .80;
    font-size: 12px;
  }
  .fl{ display:flex; gap: 10px; align-items:center; flex-wrap:wrap; }
  .miniMark{
    width: 30px; height: 30px;
    border-radius: 12px;
    display:grid; place-items:center;
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.10);
    font-weight: 1100;
  }
  .fBrand{ font-weight: 1100; }
  .sep{ opacity:.45; }
  .fr{ display:flex; gap: 10px; flex-wrap:wrap; justify-content:flex-end; }

  /* ---------- Responsive ---------- */
  @media (max-width: 1080px){
    .hero{ grid-template-columns: 1fr; }
    .kpis{ grid-template-columns: 1fr; }
    .grid4{ grid-template-columns: 1fr; }
    .pillars{ grid-template-columns: 1fr; }
    .steps{ grid-template-columns: 1fr; }
    .secGrid{ grid-template-columns: 1fr; }
    .ctaBlock{ flex-direction: column; align-items:flex-start; }
  }

  @media (prefers-reduced-motion: reduce){
    .h1, .h2, .dot{ animation: none !important; }
    .btn, .ghost, .card{ transition: none !important; }
  }
</style>
