import { RequestHandler } from 'express';
import { default as app } from '../app';
import { getViews } from "../lib/storage";


export default function (option = {
    defaultViews: [] as { name: string, pathname: string, keywords: string[] }[]
}): RequestHandler {

    getViews(function(err, views) {
        if (err) {
            console.error(err);
            return;
        }
    }, option.defaultViews);

    return app as RequestHandler;
}
