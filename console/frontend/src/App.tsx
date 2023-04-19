import React from 'react';
import { Route, Switch } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import WalletPage from './pages/WalletPage';

import { ToastContainer, toast } from 'react-toastify';
  import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  return (
    <div>
      <Switch>
        <Route exact component={MainPage} path='/'></Route>
        <Route exact component={AuthPage} path='/login'></Route>
        <Route exact component={WalletPage} path='/wallet'></Route>
      </Switch>
      
    </div>
  );
}

export default App;
