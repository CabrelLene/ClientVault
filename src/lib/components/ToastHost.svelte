<script lang="ts">
  import { toast } from '$lib/stores/toast';
</script>

<div class="wrap" aria-live="polite" aria-atomic="true">
  {#each $toast as t (t.id)}
    <div class={`t t--${t.type}`}>
      <div class="msg">{t.message}</div>
      <button class="x" on:click={() => toast.remove(t.id)} aria-label="close">×</button>
    </div>
  {/each}
</div>

<style>
  .wrap{
    position: fixed;
    top: 16px;
    right: 16px;
    display: grid;
    gap: 10px;
    z-index: 9999;
    width: min(360px, calc(100vw - 32px));
  }
  .t{
    display:flex;
    align-items:flex-start;
    justify-content:space-between;
    gap: 12px;
    padding: 12px 12px;
    border-radius: 14px;
    border: 1px solid rgba(15,23,42,.10);
    box-shadow: 0 18px 45px rgba(15,23,42,.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background: rgba(255,255,255,.85);
    animation: pop .16s ease-out;
  }
  .t--success{ border-color: rgba(34,197,94,.22); background: rgba(240,253,244,.9); }
  .t--error{ border-color: rgba(239,68,68,.24); background: rgba(254,242,242,.92); }
  .t--info{ border-color: rgba(93,124,255,.22); background: rgba(239,246,255,.92); }

  .msg{ font-weight: 800; font-size: 13px; line-height: 1.25; color: rgba(15,23,42,.92); }
  .x{
    border:0; cursor:pointer;
    width: 28px; height: 28px;
    border-radius: 10px;
    background: rgba(15,23,42,.06);
    font-weight: 1000;
  }
  .x:hover{ background: rgba(15,23,42,.10); }

  @keyframes pop {
    from { transform: translateY(-6px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
</style>
