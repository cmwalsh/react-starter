import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';
import swig from 'swig';

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { match, RoutingContext } from 'react-router';
import routes from './app/routes';

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', process.env.PORT || 4000);

app.use((request, response) => {
    match({ routes, location: request.url }, (error, redirectLocation, renderProps) => {
        const html = ReactDOMServer.renderToString(<RoutingContext {...renderProps} />);
        const page = swig.renderFile('views/index.html', { html: html });
        response.send(page);
    });
});

app.listen(app.get('port'), () => {
    console.log('Express server is listening on port ' + app.get('port'));
});
