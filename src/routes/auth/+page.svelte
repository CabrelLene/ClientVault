<script lang="ts">
  import '$lib/styles/auth.css';
  export let form: { signinError?: string; signupError?: string; signupOk?: boolean };

  let isSignup = false;
</script>

<main class="page">
  <section class="auth" class:is-signup={isSignup} id="auth">

    <!-- REGISTER -->
    <div class="panel panel--form panel--signup">
      <form class="card" method="POST" action="?/signup">
        <h2>Registration</h2>

        <label class="field">
          <div class="field__control">
            <input name="email" type="email" placeholder="Email" required />
            <span class="field__icon">✉️</span>
          </div>
        </label>

        <label class="field">
          <div class="field__control">
            <input name="password" type="password" placeholder="Password" required minlength="6" />
            <span class="field__icon">🔒</span>
          </div>
        </label>

        <button class="btn btn--primary" type="submit">Register</button>

        {#if form?.signupError}
          <p style="color:#b91c1c;margin:0;font-size:12px;">{form.signupError}</p>
        {/if}
        {#if form?.signupOk}
          <p style="color:#065f46;margin:0;font-size:12px;">
            Inscription OK. Selon config, vérifie ton email si demandé.
          </p>
        {/if}

        <p class="muted">or register with social platforms</p>
        <div class="social">
          <button class="social__btn" type="button">G</button>
          <button class="social__btn" type="button">f</button>
          <button class="social__btn" type="button">⌂</button>
          <button class="social__btn" type="button">in</button>
        </div>
      </form>
    </div>

    <!-- LOGIN -->
    <div class="panel panel--form panel--signin">
      <form class="card" method="POST" action="?/signin">
        <h2>Login</h2>

        <label class="field">
          <div class="field__control">
            <input name="email" type="email" placeholder="Email" required />
            <span class="field__icon">👤</span>
          </div>
        </label>

        <label class="field">
          <div class="field__control">
            <input name="password" type="password" placeholder="Password" required minlength="6" />
            <span class="field__icon">🔒</span>
          </div>
        </label>

        <button
  class="link"
  type="button"
  on:click={() => {
    // TODO: tu peux ouvrir une modal ou rediriger vers /auth/reset plus tard
    alert('Fonction "reset password" à ajouter (prochaine étape).');
  }}
>
  Forgot Password?
</button>


        <button class="btn btn--primary" type="submit">Login</button>

        {#if form?.signinError}
          <p style="color:#b91c1c;margin:0;font-size:12px;">{form.signinError}</p>
        {/if}

        <p class="muted">or login with social platforms</p>
        <div class="social">
          <button class="social__btn" type="button">G</button>
          <button class="social__btn" type="button">f</button>
          <button class="social__btn" type="button">⌂</button>
          <button class="social__btn" type="button">in</button>
        </div>
      </form>
    </div>

    <!-- OVERLAY -->
    <div class="overlay">
      <div class="overlay__shape" aria-hidden="true"></div>

      <div class="overlay__content overlay__content--left">
        <h1>Hello, Welcome!</h1>
        <p class="overlay__hint">Don’t have an account?</p>
        <button class="btn btn--ghost" type="button" on:click={() => (isSignup = true)}>
          Register
        </button>
      </div>

      <div class="overlay__content overlay__content--right">
        <h1>Welcome Back!</h1>
        <p class="overlay__hint">Already have an account?</p>
        <button class="btn btn--ghost" type="button" on:click={() => (isSignup = false)}>
          Login
        </button>
      </div>
    </div>

  </section>
</main>
