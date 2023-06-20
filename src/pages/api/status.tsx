import type { NextApiRequest, NextApiResponse } from "next";
import { statusSchema, statusSchemaZod } from "../../libs/interfaces";
import { getStatusFileContent, uploadStatusFile } from "../../libs/storage";
import { withAuth } from '../../libs/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse<statusSchema>) {
    const { method } = req;

    switch (method) {
        case "GET":
            res.status(200).json(await getStatusFileContent());
            break;

        case "POST":
            if (req.headers["content-type"] != "application/json") res.status(415).end("content-types: application/json must be set");

            if (!withAuth(req, res)) {
                res.status(401).end("Not authorized");
                break;
            }
            const body = req.body;
            const validate = statusSchemaZod.safeParse(body);
            if (!validate.success) {
                const { errors } = validate.error;
                res.status(400).end("Validating input failed");
                //res.status(400).json({ error: { message: "Invalid request", errors}});
            } else {
                uploadStatusFile(JSON.stringify(body));
                console.log("Uploaded file");
            }
            res.status(200).json(await getStatusFileContent());

            break;
        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
};

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '100kb',
        },
    },
}