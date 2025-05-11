import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
export const load: PageServerLoad = async ({cookies}) => {
	const user = cookies.get('user');
	if (!user) {
		throw redirect(302, '/login');
	}
	return {user}
};
