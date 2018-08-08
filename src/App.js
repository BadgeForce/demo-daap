import React, { Component } from 'react';
import HomepageLayout from './components/home/home.js';
import { Provider } from 'mobx-react';
import { default as stores } from './components/stores';
import {sleep} from './components/verifier';
import {Dimmer, Loader, Header, Image, Grid} from 'semantic-ui-react';
import {styles} from './components/common-styles';
import logo from './images/ourproblem.png';

import './css/styles.css';

class App extends Component {
  state = {loading: true, message: 'Loading'}
  async componentDidMount() {
      this.loading(true)
      if(stores.accountStore.current === null) {
          this.loadingMsg('Loading Accounts')
          await sleep(1);
          await stores.accountStore.getCache();
          this.loadingMsg('Loading Issuance Data')
          await sleep(1);
          await stores.accountStore.current.loadIssuances()
          this.loadingMsg('Loading Transactions')
          await sleep(1);
          await stores.accountStore.current.loadTransactions()
          this.loadingMsg('Loading Badges')
          await stores.badgeStore.setAccount(stores.accountStore.current, console.log)
          await sleep(1);
          this.loading(false);
      } 
  }
  loading = (loading) => {
    this.setState({loading});
  }
  loadingMsg = (message) => {
    this.setState({message});
  }
  render() {
    return (
        <div className="App">
          <Grid.Column style={{display: 'flex', alignItems: 'center', justifyContent: 'center',}}>
            {this.state.loading ? <Image style={{padding: '4em',}} src={logo} size='large' /> : null}
            <Loader active={this.state.loading} content={<Header content={this.state.message} style={styles.navMenuHeader} />} />
          </Grid.Column>
          {this.state.loading ? null : <Provider {...stores}><HomepageLayout /></Provider>}
        </div>
    );
  }
}

export default App;
 