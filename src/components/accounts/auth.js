import React, { Component } from 'react';
import { Route } from 'react-router-dom'
import {observer, inject} from 'mobx-react';
import { Form, Segment, Grid, Item, Header, Message, Dimmer, Loader } from 'semantic-ui-react'
import { styles } from '../common-styles';
import { sleep } from '../verifier';
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon/Icon';

@observer
@inject('accountStore')
class NoAccounts extends Component {

    noAccountsError = {
        content: 'Redirecting you to the accounts page, your accounts will automatically be detected or you can create/import them. If you aren\'t redirected click the button to do it manually',
        header: 'Looks like an account could not be detected or haven\'t been loaded'
    }

    state = {timeLeft: 5}

    componentDidMount() {
        if(this.props.accountStore.current === null) this.startCountDown();
    }

    startCountDown = async () => {
        let { timeLeft } = this.state;
        while(timeLeft !== 0) {
            await sleep(1);
            timeLeft--;
            this.setState({timeLeft})
        }

        this.redirect()
    }

    redirect = () => {
        this.props.history.push("/accounts", { from: this.props.location, redirect: true })
    }

    render() {
        return (
            <Segment style={{
                padding: '4em 0em'
            }} vertical>
                <Grid container stackable>
                    <Grid.Row >
                        <Grid.Column floated='right' width={8}>
                            <Form.Group>
                                <Form.Button style={styles.buttonDark} onClick={this.redirect} size='large' content={`Redirecting in ${this.state.timeLeft}`} icon='user' labelPosition='right'/>
                            </Form.Group>
                        </Grid.Column>
                        <Grid.Column width={6}>
                            <Item>
                                <Item.Header textAlign='left' as={Header}>
                                    <Icon name='exclamation triangle' color='red' />
                                    <Header.Content as='h1' className='content-header-error' content={this.noAccountsError.header} />
                                    <Header.Content as={Message} error className='content-subheader' content={this.noAccountsError.content} />
                                </Item.Header>                                                          
                            </Item>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        );
    }

}

@inject('accountStore')
@observer
export class AccountAuth extends Component {

    
    noAccountDetected(props) {
        return this.props.accountStore.current === null;
    }

    renderLoading() {
        return (
            <Dimmer active inverted>
                <Loader inverted>Loading</Loader>
            </Dimmer>
        );
    }

    render() {
        const { component: Component, ...rest } = this.props;
        return (
            !this.props.accountStore.loadingCache ? <Route  {...rest} render={ props => this.noAccountDetected() ? <NoAccounts {...props} /> : <Component {...props} /> }  />: this.renderLoading()
        );
    }
}