import type { NextApiRequest, NextApiResponse } from "next";
import { DomainVersionComparison, ErrorResponse } from "../../../../../libs/interfaces";
import { getGroupDomainComparison } from "../../../../../libs/storage";
import xss from "xss";

export default async function handler(req: NextApiRequest, res: NextApiResponse<DomainVersionComparison | ErrorResponse>) {
    const { method } = req;
    const group = xss(req.query.group as string);
    const domain = xss(req.query.domain as string);

    switch (method) {
        case "GET": {
            const content = await getGroupDomainComparison(group, domain);
            if (!content) {
                res.status(404).json({ error: "Group or domain not found" });
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
