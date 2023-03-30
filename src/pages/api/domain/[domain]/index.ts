import type { NextApiRequest, NextApiResponse } from "next";
import { getDomain } from "../../../../libs/storage";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    let domain = req.query.domain as string;
    console.log("domain index " + domain)
    switch (method) {
        case "GET":
            const content = await getDomain(domain)
            console.log("got domain info")
            if (content) {
                // console.log(content)
                res.status(200).json(content);
            } else {
                console.log("Domain not exist")
                res.status(404).send("domain not found")
            }
            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}