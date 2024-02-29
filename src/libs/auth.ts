import type { NextApiRequest } from "next";
const inDevelopment = process.env.NODE_ENV === 'development'

export function withAuth(req: NextApiRequest) {
    if (!req.headers || !req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return false;
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (inDevelopment){
       console.log("withAuth", process.env.dpSecret)
    }
    if (!(username === "dpuser" && password === process.env.dpSecret)) {
        return false;
    }
    return true;
}


