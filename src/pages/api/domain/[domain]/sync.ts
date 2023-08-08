import type { NextApiRequest, NextApiResponse } from "next";
import { getDomainSyncStatus } from "../../../../libs/storage";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    let domain = req.query.domain as string;
    //console.log("domain index " + domain)
    switch (method) {
        case "GET":
            const content = await getDomainSyncStatus(domain);
            if (content) {
                res.status(200).end(domain + " is in sync");
            } else {
                res.status(200).end(domain + " is not in sync");
            }
            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}