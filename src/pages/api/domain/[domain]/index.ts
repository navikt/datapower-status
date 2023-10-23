import type { NextApiRequest, NextApiResponse } from "next";
import { deleteDomain, getDomain } from "../../../../libs/storage";
import { withAuth } from "../../../../libs/auth";
import { SuccessResponse, ErrorResponse } from "../../../../libs/interfaces";
import xss from "xss";
interface OneDomainsInterface {
    [index: number]: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<OneDomainsInterface|SuccessResponse|ErrorResponse>) {
    const { method } = req;
    const domain = xss(req.query.domain as string);
    //console.log("domain index " + domain)
    switch (method) {
        case "GET": {
            const content = await getDomain(domain)
            console.log("got domain info")
            if (content) {
                res.status(200).json(content);
            } else {
                console.log("Domain not found")
                const errorResponse: ErrorResponse = { error: 'Domain not found' };
                res.status(404).json(errorResponse);
            }
            break;
        }
        case "DELETE": {
            if (!withAuth(req)) {
                const errorResponse: ErrorResponse = { error: 'Not authorized' };
                res.status(401).json(errorResponse);
                return;
            }

            const status = await deleteDomain(domain);
            if (status) {
                const successResponse: SuccessResponse  ={success: domain + " deleted"};
                res.status(204).json(successResponse);
            } else {
                const errorResponse: ErrorResponse = {error: domain + " failed to delete"}
                res.status(400).json(errorResponse);
            }

            break;
        }
        default: {
            res.setHeader('Allow', ['GET', 'DELETE']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
        }
    }
}