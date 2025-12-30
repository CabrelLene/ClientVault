<script lang="ts">
  let { status } = $props<{ status: string }>();

  type Meta = { bg: string; fg: string; dot: string; label: string };

  const meta = (s: string): Meta => {
    switch (s) {
      case 'Nouveau':
        return { bg: 'rgba(59,130,246,.12)', fg: '#1d4ed8', dot: '#3b82f6', label: s };
      case 'Qualifié':
        return { bg: 'rgba(16,185,129,.12)', fg: '#047857', dot: '#10b981', label: s };
      case 'Proposé':
        return { bg: 'rgba(245,158,11,.14)', fg: '#92400e', dot: '#f59e0b', label: s };
      case 'Gagné':
        return { bg: 'rgba(34,197,94,.14)', fg: '#166534', dot: '#22c55e', label: s };
      case 'Perdu':
        return { bg: 'rgba(239,68,68,.12)', fg: '#b91c1c', dot: '#ef4444', label: s };
      default:
        return { bg: 'rgba(15,23,42,.08)', fg: 'rgba(15,23,42,.75)', dot: 'rgba(15,23,42,.35)', label: s };
    }
  };

  // ✅ runes mode: derived au lieu de `$:`
  let c = $derived.by(() => meta(status));
</script>

<span class="pill" style="--bg:{c.bg}; --fg:{c.fg}; --dot:{c.dot}">
  <span class="dot" aria-hidden="true"></span>
  <span class="txt">{c.label}</span>
</span>

<style>
  .pill{
    display:inline-flex;
    align-items:center;
    gap: 8px;
    padding: 7px 10px;
    border-radius: 999px;
    background: var(--bg);
    color: var(--fg);
    border: 1px solid rgba(15,23,42,.10);
    font-weight: 1000;
    letter-spacing: -.01em;
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
  }
  .dot{
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--dot);
    box-shadow: 0 0 0 3px rgba(255,255,255,.7);
  }
  .txt{ opacity: .95; }
</style>
