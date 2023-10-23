import type { NextApiRequest, NextApiResponse } from "next";
import { getAllDomains } from "../../../libs/storage";
import { ErrorResponse } from "../../../libs/interfaces";

interface allDomainsInterface {
    [index: number]: string;
}


export default async function handler(req: NextApiRequest, res: NextApiResponse<allDomainsInterface | ErrorResponse>) {
//export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    console.log("domain index")
    switch (method) {
        case "GET": {
            const domain = await getAllDomains()
            console.log(domain)
            if (domain) {
                res.status(200).json(domain);
                return;
            } else {
                const errorResponse: ErrorResponse = { error: 'Failed to get domains' };
                res.status(500).json(errorResponse);
                return;
            } 
        }
        default: {
            res.setHeader('Allow', ['GET']);
            res.status(405).json({error: `Method ${method} Not Allowed`});
            break;
        }
    }
}