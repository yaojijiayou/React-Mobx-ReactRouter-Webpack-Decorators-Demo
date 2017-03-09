import React from 'react';

import {render} from 'react-dom';

import {Router ,browserHistory} from 'react-router';

import routes from './view/routes.js';

import './view/common/sass/index.scss';

render(<Router history={browserHistory} routes={routes}/>, document.getElementById('app'), function () {
    window.addEventListener('load', function () {
        FastClick.attach(document.body); 
    }, false);
});