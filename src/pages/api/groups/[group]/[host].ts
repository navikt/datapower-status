import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "../../../../libs/auth";
import { ErrorResponse, HostRecord, SuccessResponse } from "../../../../libs/interfaces";
import { deleteHostFromGroup, getGroup, saveGroupHost } from "../../../../libs/storage";
import xss from "xss";

export default async function handler(req: NextApiRequest, res: NextApiResponse<HostRecord | SuccessResponse | ErrorResponse>) {
    const { method } = req;
    const group = xss(req.query.group as string);
    const host = xss(req.query.host as string);
    console.log(`group: ${group}, host: ${host}`);
    switch (method) {
        case "POST": {
            if (!withAuth(req)) {
                res.status(401).json({ error: "Not authorized" });
                return;
            }

            await saveGroupHost(group, host);
            res.status(201).json({ success: `${host} added to ${group}` });
            break;
        }
        case "DELETE": {
            if (!withAuth(req)) {
                res.status(401).json({ error: "Not authorized" });
                return;
            }

            const status = await deleteHostFromGroup(group, host);
            if (!status) {
                res.status(400).json({ error: `${host} failed to delete from ${group}` });
                return;
            }

            res.status(204).json({ success: `${host} deleted from ${group}` });
            break;
        }
        case "GET": {
            const content = await getGroup(group);
            if (!content) {
                res.status(404).json({ error: "Group or host not found" });
                return;
            }

            const hostRecord = content.hosts.find((entry) => entry.hostName === host);
            if (!hostRecord) {
                res.status(404).json({ error: "Group or host not found" });
                return;
            }

            res.status(200).json(hostRecord);
            break;
        }
        default: {
            res.setHeader("Allow", ["GET", "POST", "DELETE"]);
            res.status(405).json({ error: `Method ${method} Not Allowed` });
            break;
        }
    }
}
