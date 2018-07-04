import React, { Component } from 'react';
import { Home } from './components/home';
import { Provider } from 'mobx-react';
import { default as stores } from './components/stores';

import './App.css';

class App extends Component {
  render() {
    return (
      <Provider {...stores}>
        <div className="App">
          <Home />
        </div>
      </Provider>
    );
  }
}

export default App;
 