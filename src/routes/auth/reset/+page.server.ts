import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // ✅ check authentifié (safe)
  const { data } = await locals.supabase.auth.getUser();
  if (data.user) throw redirect(303, '/app');
  return {};
};

export const actions: Actions = {
  default: async ({ request, locals, url }) => {
    const form = await request.formData();
    const email = String(form.get('email') ?? '').trim();

    if (!email) return fail(400, { error: 'Email obligatoire.' });

    const redirectTo = `${url.origin}/auth/update`;

    const { error } = await locals.supabase.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    if (error) return fail(400, { error: error.message });

    // On ne révèle pas si l'email existe ou non
    return { ok: true };
  }
};
