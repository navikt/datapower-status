import type { NextApiRequest, NextApiResponse } from "next";
import { getDomainSyncStatus } from "../../../../libs/storage";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    let domain = req.query.domain as string;
    //console.log("domain index " + domain)
    switch (method) {
        case "GET":
            const content = await getDomainSyncStatus(domain)
            if (content) {

                let oldversion = null;
                let okStatus = false;
                //console.log(content)
                for ( let host in content) {
                  //  console.log(host)
                    if ( !oldversion ) {
                        console.log("oldversion is null");
                        oldversion = content[host];
                        continue;
                    }
                    if (oldversion != content[host]) {
                        console.log("oldversion is not equal");
                        console.log(oldversion + " " + content[host]);
                        okStatus = false;
                    }else {
                        okStatus = true;
                    }
                }
                if (okStatus) {
                    res.status(200).send(domain + " is in sync");
                } else {
                    res.status(200).send(domain + " is not in sync");
                }

            } else {
                //console.log("domain not found");
                res.status(200).send("domain not found");
            }
            break;
        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}