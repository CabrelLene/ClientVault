<script lang="ts">
  let { title, value, hint, icon = '✨' } = $props<{
    title: string;
    value: string;
    hint?: string;
    icon?: string;
  }>();
</script>

<div class="card">
  <div class="row">
    <div class="ic">{icon}</div>
    <div class="t">{title}</div>
  </div>

  <div class="v">{value}</div>
  {#if hint}
    <div class="h">{hint}</div>
  {/if}
</div>

<style>
  .card{
    border-radius: 18px;
    border: 1px solid rgba(15,23,42,.08);
    background: rgba(255,255,255,.72);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow: 0 18px 60px rgba(15,23,42,.08);
    padding: 14px 14px 16px;
    transition: transform .15s cubic-bezier(.2,.8,.2,1), box-shadow .2s cubic-bezier(.2,.8,.2,1);
    will-change: transform;
  }
  .card:hover{
    transform: translateY(-2px);
    box-shadow: 0 26px 80px rgba(15,23,42,.12);
  }
  .row{
    display:flex;
    align-items:center;
    gap:10px;
    opacity:.95;
  }
  .ic{
    width: 34px; height: 34px;
    border-radius: 14px;
    display:grid; place-items:center;
    background: rgba(93,124,255,.12);
    border: 1px solid rgba(93,124,255,.18);
    font-weight: 900;
  }
  .t{
    font-weight: 1000;
    letter-spacing:-0.01em;
    font-size: 13px;
    opacity:.85;
  }
  .v{
    margin-top: 10px;
    font-size: 26px;
    font-weight: 1000;
    letter-spacing:-0.02em;
  }
  .h{
    margin-top: 6px;
    font-size: 12px;
    opacity:.65;
    line-height: 1.35;
  }
</style>
