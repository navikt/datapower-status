import { btoa } from 'buffer';

export function createAuth(password = process.env.dpSecret): string {
    const auth = `Basic ${btoa("dpuser:" + password)}`;
    console.log(auth);
    return auth;
}
