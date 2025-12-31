// src/routes/app/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const user = await locals.safeGetUser();
  if (!user) throw redirect(303, `/auth?next=${encodeURIComponent(url.pathname + url.search)}`);

  return { user: { id: user.id, email: user.email } };
};
