import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  if (session) throw redirect(303, '/app');
  return {};
};

function readCreds(form: FormData) {
  const email = String(form.get('email') ?? '').trim();
  const password = String(form.get('password') ?? '');
  return { email, password };
}

export const actions: Actions = {
  signin: async ({ request, locals }) => {
    const form = await request.formData();
    const { email, password } = readCreds(form);

    if (!email || !password) {
      return fail(400, { signinError: 'Email et mot de passe obligatoires.' });
    }

    const { error } = await locals.supabase.auth.signInWithPassword({ email, password });
    if (error) return fail(400, { signinError: error.message });

    throw redirect(303, '/app?toast=' + encodeURIComponent('Bienvenue 👋') + '&type=success');
  },

  signup: async ({ request, locals, url }) => {
    const form = await request.formData();
    const { email, password } = readCreds(form);

    if (!email || !password) {
      return fail(400, { signupError: 'Email et mot de passe obligatoires.' });
    }

    // (Optionnel) mot de passe minimum
    if (password.length < 8) {
      return fail(400, { signupError: 'Mot de passe trop court (min 8 caractères).' });
    }

    const { error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        // utile si tu actives la confirmation email
        emailRedirectTo: `${url.origin}/auth`
      }
    });

    if (error) return fail(400, { signupError: error.message });

    // Si confirmation email activée, l'utilisateur doit confirmer.
    // Sinon, il sera connecté directement selon config Supabase.
    return { signupOk: true };
  }
};
