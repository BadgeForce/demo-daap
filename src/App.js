import React, { Component } from 'react';
import HomepageLayout from './components/home/home.js';
import { Provider } from 'mobx-react';
import { default as stores } from './components/stores';

import './css/styles.css';

class App extends Component {
  render() {
    return (
      
      <Provider {...stores}>
        <div className="App">
          <HomepageLayout />
        </div>
      </Provider>
    );
  }
}

export default App;
 