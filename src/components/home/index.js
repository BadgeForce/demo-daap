import React, { Component } from 'react';
import { Grid, Menu, Icon, Header, Dropdown, Input } from 'semantic-ui-react';
import { Verifier } from '../verifier';
import { Issuer } from '../issuer';
import { Badges } from '../badges';
import { toast } from "react-toastify";
import {observer, inject} from 'mobx-react';
import 'react-toastify/dist/ReactToastify.css';

@inject('accountStore')
@observer
export class Home extends Component {  
    constructor(props) {
        super(props);
        this.state = {
            active: 'verifier',
        }

        this.getCurrentAccountHeader = this.getCurrentAccountHeader.bind(this);

        this.headers = {
            verifier: {
                content: 'Verifier',
                subheader: 'Enter the name of the Academic Credential, the Recipients public key, and the Institution ID of the issuing institution'
            },
            issuer: {
                content: 'BadgeForce University Issuer',
                subheader: 'Issue some credentials to whoever you want, from our fictitous BadgeForce Issuer. These credentials are issued for REAL, so DO NOT USE ANY SENSITIVE DATA'
            },
            badges: {
                content: 'Badges',
                subheader: 'Current badges for this account'
            }     
        }

        this.accountStore = this.props.accountStore;
    }

    renderContent() {
        let component;
        switch (this.state.active) {
            case 'issuer':
                component = <Issuer updateToast={(id, message, type) => toast.update(id, {render: message, type, autoClose: 15000})} notify={this.notify} />;
                break;
            
            case 'badges': 
                component = <Badges updateToast={this.updateToast} notify={this.notify} />
                break;
            default:
                component = <Verifier updateToast={this.updateToast} notify={this.notify} />
                break;
        }

        return component;
    }

    getSubHeader(active) {
        return this.subheaders[this.state.active]
    }

    getCurrentAccountHeader() {
        if(this.accountStore.current) {
            return `Active Account: ${this.accountStore.current.account.publicKey}`;
        }
        return 'No Account Detected';
    }

    render() {
      return (
        <Grid style={{paddingTop: 40}} columns={2} centered container stackable>
            <Header as='h1' content={this.headers[this.state.active].content} textAlign='center' subheader={this.headers[this.state.active].subheader} />
            <Grid.Row>
                <Grid.Column width={4} >
                    <Menu vertical size='huge' fluid>
                        <Menu.Item icon='key' header name={this.getCurrentAccountHeader()} />
                        <Dropdown text='Switch Account' icon='filter' floating labeled item className='icon'>
                            <Dropdown.Menu>
                            <Input icon='search' iconPosition='left' className='search' />
                            <Dropdown.Divider />
                            <Dropdown.Menu scrolling>
                                {this.accountStore.accounts
                                .map(account => {return {text: account.account.publicKey, value: account.account.publicKey, label: { color: 'red', empty: true, circular: true }}})
                                .map(option => <Dropdown.Item onClick={(e, data) => this.accountStore.switchAccount(data.value)} key={option.value} {...option} />)}
                            </Dropdown.Menu>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Menu.Item>
                            <Icon name='student' />
                            <Menu.Menu>
                                <Menu.Item header name='badges' onClick={() => this.setState({active: 'badges'})} />
                            </Menu.Menu>
                        </Menu.Item>
                        <Menu.Item icon='university' header name='issuer' onClick={() => this.setState({active: 'issuer'})} />
                        <Menu.Item icon='checkmark' header name='verifier' onClick={() => this.setState({active: 'verifier'})} />
                    </Menu>
                </Grid.Column> 
                <Grid.Column style={{height: '100vh'}} computer={12} mobile={4} tablet={12}>
                    {this.renderContent()}
                </Grid.Column>  
            </Grid.Row> 
        </Grid>
      )
    }
}
