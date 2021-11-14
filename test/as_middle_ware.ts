import * as express from 'express';
import logApp from '../lib/middleware';

const testApp = express();

testApp.use('/__log__', logApp({
    defaultViews: [{
        name: 'default',
        pathname: './test/views/default.ejs',
        keywords: ['default']
    }]
}));


testApp.listen(process.env.PORT || 3000, () => {
    console.log('test server start');
});
