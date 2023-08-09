import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "../../../../libs/auth";
import { deleteHostFromDomain, getDomainWithHost, saveDomainVersion } from "../../../../libs/storage";
import xss from "xss";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const domain = xss(req.query.domain as string);
    const host = xss(req.query.host as string);

    switch (method) {
        case "GET":
            const content: JSON = await getDomainWithHost(domain, host)

            if (content) {
                res.status(200).json(content);
            } else {
                console.log("Domain or host not exist")
                res.status(404).end("domain or host not found")
            }
            break;
        case "POST":
            //console.log("POSTing version to " + version + " " + host + " " + domain)
            if (!withAuth(req, res)) {
                res.status(401).end("Not authorized");
                break;
            }
            const version = req.body as string;
            await saveDomainVersion(domain, host, version);
            res.status(201).send(version);
            break;
        case "DELETE":
            if (!withAuth(req, res)) {
                res.status(401).end("Not authorized");
                break;
            }
            await deleteHostFromDomain(domain, host);
            //console.log("DELETEing %s from %s", host, domain);
            res.status(204).end();
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }

}