<script lang="ts">
  import '$lib/styles/auth-reset.css';

  let { data, form } = $props<{
    data: { hasUser: boolean };
    form: { error?: string };
  }>();
</script>

<main class="wrap">
  <section class="card">
    <div class="top">
      <div class="logo">CV</div>
      <div>
        <h1>New password</h1>
        <p class="sub">
          {#if data.hasUser}
            Choisis un nouveau mot de passe. Puis reconnecte-toi.
          {:else}
            Le lien est invalide ou expiré. Recommence la procédure.
          {/if}
        </p>
      </div>
    </div>

    {#if !data.hasUser}
      <div class="ok" style="border-color: rgba(245,158,11,.22); background: rgba(245,158,11,.12);">
        <div class="ok__t">Lien invalide</div>
        <div class="ok__s">Retourne sur reset password pour générer un nouveau lien.</div>
      </div>

      <div class="foot" style="margin-top: 12px;">
        <a class="link" href="/auth/reset">→ Go to reset</a>
      </div>
    {:else}
      <form method="POST" class="form">
        <label class="field">
          <span>New password</span>
          <input name="password" type="password" minlength="6" required placeholder="••••••••" />
        </label>

        <label class="field">
          <span>Confirm</span>
          <input name="confirm" type="password" minlength="6" required placeholder="••••••••" />
        </label>

        {#if form?.error}
          <p class="msg msg--err">{form.error}</p>
        {/if}

        <button class="btn" type="submit">Update password</button>

        <div class="foot">
          <a class="link" href="/auth">← Back to login</a>
        </div>
      </form>
    {/if}
  </section>
</main>
