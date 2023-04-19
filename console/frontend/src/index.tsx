import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import 'semantic-ui-css/semantic.min.css'
import {HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';


ReactDOM.render(
        <HashRouter>
            <App />
            <ToastContainer />
        </HashRouter>
        , 
    document.getElementById('root')
);

