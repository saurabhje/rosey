import type { RequestHandler } from './$types';
import { serialize } from 'cookie';
import { env } from '$env/dynamic/private';

const users = [
    { username: 'rosey', password: env.RP },
    { username: 'je', password: env.RAP },
    { username: 'guest', password: env.GP },
]
export const POST: RequestHandler = async ({ request }) => {
    const { username, password } = await request.json();
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user){
        return new Response('Invalid credentials', { status: 401 });
    }
    return new Response(null, {
        status: 200,
        headers: {
            'Set-Cookie': serialize('user', user.username, {
                path: '/',
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7,
                sameSite: 'strict',
    })
}
    })
}