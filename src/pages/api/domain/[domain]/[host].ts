import type { NextApiRequest, NextApiResponse } from "next";
import { withAuth } from "../../../../libs/auth";
import { deleteHostFromDomain, getDomainWithHost, saveDomainVersion } from "../../../../libs/storage";
import xss from "xss";
import { SuccessResponse, ErrorResponse } from "../../../../libs/interfaces";

interface VersionStringInterface {
    [index: number]: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<VersionStringInterface|SuccessResponse|ErrorResponse>) {
    const { method } = req;
    const domain = xss(req.query.domain as string);
    const host = xss(req.query.host as string);

    switch (method) {
        case "GET": {
            const content: string = await getDomainWithHost(domain, host);
            console.log("host content")
            console.log(content)
            if (content) {
                res.status(200).json(content);
            } else {
                console.log("Domain or host not exist")
                const errorResponse: ErrorResponse = { error: 'Domain or host not exist' };
                res.status(404).json(errorResponse);
            }
            break;
        }
        case "POST": {
            if (!withAuth(req)) {
                const errorResponse: ErrorResponse = { error: 'Not authorized' };
                res.status(401).json(errorResponse);
                return;
            }
            const version = xss(req.body as string);
            await saveDomainVersion(domain, host, version);
            res.status(201).send(version);
            break;
        }
        case "DELETE": {
            if (!withAuth(req)) {
                const errorResponse: ErrorResponse = { error: 'Not authorized' };
                res.status(401).json(errorResponse);
                return;
            }
            await deleteHostFromDomain(domain, host);
            //console.log("DELETEing %s from %s", host, domain);
            const successResponse: SuccessResponse  ={success: host + " deleted"};
            res.status(204).json(successResponse);
            break;
        }
        default: {
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
        }
    }

}