import type { NextApiRequest, NextApiResponse } from "next";
import { getAllDomains } from "../../../libs/storage";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    console.log("domain index")
    switch (method) {
        case "GET":
            const domain = await getAllDomains()
            if (domain != undefined) {
                res.status(200).json(domain);
            } else { res.status(500).end()}
            break;
        case "POST":
            //console.log(req.body)
            console.log("POST is not implemented yet")
            res.end()
            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}