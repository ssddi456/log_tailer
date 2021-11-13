import { RequestHandler } from 'express';
import { default as app } from '../app';
export default function (option = {}): RequestHandler {
    return app as RequestHandler;
}
