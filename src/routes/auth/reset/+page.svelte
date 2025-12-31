<script lang="ts">
  import '$lib/styles/auth-reset.css';

  let { form } = $props<{ form: { error?: string; ok?: boolean } }>();
</script>

<main class="wrap">
  <section class="card">
    <div class="top">
      <div class="logo">CV</div>
      <div>
        <h1>Reset password</h1>
        <p class="sub">Entre ton email. On t’envoie un lien pour choisir un nouveau mot de passe.</p>
      </div>
    </div>

    <form method="POST" class="form">
      <label class="field">
        <span>Email</span>
        <input name="email" type="email" required placeholder="you@email.com" />
      </label>

      {#if form?.error}
        <p class="msg msg--err">{form.error}</p>
      {/if}

      {#if form?.ok}
        <div class="ok">
          <div class="ok__t">Si cet email existe, un lien vient d’être envoyé.</div>
          <div class="ok__s">Vérifie aussi tes spams. Le lien ouvre la page “New password”.</div>
        </div>
      {/if}

      <button class="btn" type="submit">Send reset link</button>

      <div class="foot">
        <a class="link" href="/auth">← Back to login</a>
      </div>
    </form>
  </section>
</main>
