import { NextApiRequest, NextApiResponse } from "next";
import { getVeraStatus } from "../../../libs/vera/veraUtils";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;

    switch ( method ) {
        case "GET": {
            await getVeraStatus();
            res.status(404).json("Not yet implemented");
            break;
        }
        default: {
            res.setHeader('Allow', ['GET', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
        }
    }
    
}