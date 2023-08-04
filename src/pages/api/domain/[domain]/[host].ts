import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "../../../../libs/auth";
import { deleteHostFromDomain, getDomainWithHost, saveDomainVersion } from "../../../../libs/storage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    let domain = req.query.domain as string;
    let host = req.query.host as string;

    switch (method) {
        case "GET":
            const content = await getDomainWithHost(domain, host)
            if (content) {
                //console.log(content)
                res.status(200).json(content);
            } else {
                console.log("Domain or host not exist")
                res.status(404).end("domain or host not found")
            }
            break;
        case "POST":
            let version  = req.body as string;
            //console.log("POSTing version to " + version + " " + host + " " + domain)
            if (!withAuth(req, res)) {
                res.status(401).end("Not authorized");
                break;
            }
            saveDomainVersion(domain, host, version);
            res.status(200).send(version);
            break;
        case "DELETE":
            if (!withAuth(req, res)) {
                res.status(401).end("Not authorized");
                break;
            }
            deleteHostFromDomain(domain, host);
            //console.log("DELETEing %s from %s", host, domain);
            res.end();
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }

}