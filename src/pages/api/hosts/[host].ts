import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "../../../libs/auth";
import { ErrorResponse, HostMetadata, HostRecord, hostMetadataSchemaZod } from "../../../libs/interfaces";
import { getHostStatus, saveHostStatus } from "../../../libs/storage";
import xss from "xss";

export default async function handler(req: NextApiRequest, res: NextApiResponse<HostMetadata | HostRecord | ErrorResponse>) {
    const { method } = req;
    const host = xss(req.query.host as string);

    switch (method) {
        case "GET": {
            const content = await getHostStatus(host);
            if (!content) {
                res.status(404).json({ error: "Host not found" });
                return;
            }
            res.status(200).json(content);
            break;
        }
        case "POST": {
            if (!withAuth(req)) {
                res.status(401).json({ error: "Not authorized" });
                return;
            }

            const validate = hostMetadataSchemaZod.safeParse(req.body);
            if (!validate.success) {
                res.status(400).json({ error: "Validating input failed" });
                return;
            }

            if (validate.data.dpInstance !== host) {
                res.status(400).json({ error: "Host name does not match dpInstance" });
                return;
            }

            await saveHostStatus(validate.data);
            res.status(201).json(validate.data);
            break;
        }
        default: {
            res.setHeader("Allow", ["GET", "POST"]);
            res.status(405).json({ error: `Method ${method} Not Allowed` });
            break;
        }
    }
}
