import * as express from 'express';
import logApp from '../lib/middleware';

const testApp = express();

testApp.use('/__log__', logApp());


testApp.listen(process.env.PORT || 3000, () => {
    console.log('test server start');
});
