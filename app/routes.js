import React from 'react';
import ReactDOM from 'react-dom';
import { Route, IndexRoute } from 'react-router';

import App from './components/App';
import Dashboard from './components/Dashboard';

export default (
    <Route path='/' component={App}>
        <IndexRoute component={Dashboard} />
    </Route>
);
