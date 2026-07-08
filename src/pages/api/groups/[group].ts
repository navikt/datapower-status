import type { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse, GroupHostsResponse } from "../../../libs/interfaces";
import { getGroup } from "../../../libs/storage";
import xss from "xss";

export default async function handler(req: NextApiRequest, res: NextApiResponse<GroupHostsResponse | ErrorResponse>) {
    const { method } = req;
    const group = xss(req.query.group as string);

    switch (method) {
        case "GET": {
            const content = await getGroup(group);
            if (!content) {
                res.status(404).json({ error: "Group not found" });
                return;
            }

            res.status(200).json(content);
            break;
        }
        default: {
            res.setHeader("Allow", ["GET"]);
            res.status(405).json({ error: `Method ${method} Not Allowed` });
            break;
        }
    }
}
