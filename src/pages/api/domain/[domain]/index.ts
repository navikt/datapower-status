import type { NextApiRequest, NextApiResponse } from "next";
import { deleteDomain, getDomain } from "../../../../libs/storage";
import { withAuth } from "../../../../libs/auth";
import xss from "xss";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    let domain = xss(req.query.domain as string);
    //console.log("domain index " + domain)
    switch (method) {
        case "GET":
            const content = await getDomain(domain)
            console.log("got domain info")
            if (content) {
                res.status(200).json(content);
            } else {
                console.log("Domain not exist")
                res.status(404).send("domain not found")
            }
            break;
        case "DELETE":
            if (!withAuth(req, res)) {
                res.status(401).end("Not authorized");
                break;
            }

            const status = await deleteDomain(domain);
            if (status) {
                res.status(204).end();
            } else {
                res.status(400).end();
            }

            break;
        default:
            res.setHeader('Allow', ['GET', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}