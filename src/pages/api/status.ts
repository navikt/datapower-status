import type { NextApiRequest, NextApiResponse } from "next";
import { statusSchema, statusSchemaZod, ErrorResponse } from "../../libs/interfaces";
import { getStatusFileContent, uploadStatusFile } from "../../libs/storage";
import { withAuth } from '../../libs/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse<statusSchema | ErrorResponse>) {
    const { method } = req;

    switch (method) {
        case "GET": {
            res.status(200).json(await getStatusFileContent());
            break;
        }
        case "POST": {
            if (req.headers["content-type"] != "application/json") {
                const errorResponse: ErrorResponse = { error: 'Content-Type: application/json must be set' };
                res.status(415).json(errorResponse);
                return;
            }

            if (!withAuth(req)) {
                const errorResponse: ErrorResponse = { error: 'Not authorized' };
                res.status(401).json(errorResponse);
                return;
            }
            const body = req.body;
            const validate = statusSchemaZod.safeParse(body);
            if (!validate.success) {
                const errorResponse: ErrorResponse = { error: 'Validating input failed' };
                res.status(400).json(errorResponse);
                return;
            } else {
                const data: string = JSON.stringify(validate.data);
                await uploadStatusFile(data);
                console.log("Uploaded file");
                //res.status(200).json(await getStatusFileContent());
                res.status(200).json(JSON.parse(data));
            }

            break;
        }
        default: {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
        }
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '100kb',
        },
    },
}