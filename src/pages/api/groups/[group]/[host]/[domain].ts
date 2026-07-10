import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "../../../../../libs/auth";
import { ErrorResponse, SuccessResponse } from "../../../../../libs/interfaces";
import { deleteHostFromDomain, getGroup, getDomainWithHost, saveDomainVersion } from "../../../../../libs/storage";
import xss from "xss";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string | SuccessResponse | ErrorResponse>) {
    const { method } = req;
    const group = xss(req.query.group as string);
    const host = xss(req.query.host as string);
    const domain = xss(req.query.domain as string);

    switch (method) {
        case "GET": {
            const groupContent = await getGroup(group);
            if (!groupContent || !groupContent.hosts.some((entry) => entry.hostName === host)) {
                res.status(404).json({ error: "Group or host not found" });
                return;
            }

            const content = await getDomainWithHost(domain, host);
            if (content) {
                res.status(200).json(content);
                return;
            }

            res.status(404).json({ error: "Domain or host not exist" });
            break;
        }
        case "POST": {
            if (!withAuth(req)) {
                res.status(401).json({ error: "Not authorized" });
                return;
            }

            const groupContent = await getGroup(group);
            if (!groupContent || !groupContent.hosts.some((entry) => entry.hostName === host)) {
                res.status(400).json({ error: `${host} is not part of ${group}` });
                return;
            }

            const version = xss(req.body as string);
            await saveDomainVersion(domain, host, version);
            res.status(201).send(version);
            break;
        }
        case "DELETE": {
            if (!withAuth(req)) {
                res.status(401).json({ error: "Not authorized" });
                return;
            }

            const groupContent = await getGroup(group);
            if (!groupContent || !groupContent.hosts.some((entry) => entry.hostName === host)) {
                res.status(400).json({ error: `${host} is not part of ${group}` });
                return;
            }

            await deleteHostFromDomain(domain, host);
            res.status(204).json({ success: `${host} deleted` });
            break;
        }
        default: {
            res.setHeader("Allow", ["GET", "POST", "DELETE"]);
            res.status(405).json({ error: `Method ${method} Not Allowed` });
            break;
        }
    }
}
