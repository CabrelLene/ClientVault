import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // En arrivant via le lien "recovery", Supabase doit donner un user
  const { data } = await locals.supabase.auth.getUser();
  return { hasUser: !!data.user };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await request.formData();
    const password = String(form.get('password') ?? '');
    const confirm = String(form.get('confirm') ?? '');

    if (!password || password.length < 6) {
      return fail(400, { error: 'Mot de passe: 6 caractères minimum.' });
    }
    if (password !== confirm) {
      return fail(400, { error: 'Les mots de passe ne correspondent pas.' });
    }

    const { error } = await locals.supabase.auth.updateUser({ password });
    if (error) return fail(400, { error: error.message });

    throw redirect(303, '/auth?toast=✅ Mot de passe mis à jour&type=success');
  }
};
