import type { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse } from "../../../libs/interfaces";
import { getAllGroups } from "../../../libs/storage";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string[] | ErrorResponse>) {
    const { method } = req;

    switch (method) {
        case "GET": {
            const groups = await getAllGroups();
            res.status(200).json(groups || []);
            break;
        }
        default: {
            res.setHeader("Allow", ["GET"]);
            res.status(405).json({ error: `Method ${method} Not Allowed` });
            break;
        }
    }
}
