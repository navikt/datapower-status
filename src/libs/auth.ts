import type { NextApiRequest } from "next";

export function withAuth(req: NextApiRequest) {
    //console.log("Auth required");
    if (!req.headers || !req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        return false;
    }
    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    console.log("withAuth", process.env.dpSecret)
    if (!(username === "dpuser" && password === process.env.dpSecret)) {
        return false;
    }
    //console.log("Authorization accepted");
    return true;
}


