import type { NextApiRequest, NextApiResponse } from "next";
import { getDomainSyncStatus } from "../../../../libs/storage";
import xss from "xss";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const domain = xss(req.query.domain as string);
    //console.log("domain index " + domain)
    switch (method) {
        case "GET": {
            const content = await getDomainSyncStatus(domain);
            if (content == undefined) {
                res.status(200).json(domain + " cannot find status");
            } else if (content == false) {
                res.status(200).json(domain + " is not in sync");
            }else {
                res.status(200).json(domain + " is in sync");
            }
            break;
        }
        default: {
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
        }
    }
}