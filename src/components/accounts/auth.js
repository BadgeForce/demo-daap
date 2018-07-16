import React, { Component } from 'react';
import { Route } from 'react-router-dom'
import {observer, inject} from 'mobx-react';
import { toast } from "react-toastify";
import { Toaster } from '../utils/toaster';
import { Form, Segment, Grid, Item, Header, Message, Dimmer, Loader } from 'semantic-ui-react'
import { styles } from '../common-styles';
import Icon from 'semantic-ui-react/dist/commonjs/elements/Icon/Icon';

@inject('accountStore')
@observer
export class AccountAuth extends Component {

    noAccountsError = {
        content: 'Visit the accounts page and your accounts will automatically be detected or you can create/import them',
        header: 'Looks like an active account could be detected'
    }

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

    showRedirectButton(props) {
        return (
            <Segment style={{
                padding: '4em 0em'
            }} vertical>
                <Grid container stackable>
                    <Grid.Row >
                        <Grid.Column width={6}>
                            <Item>
                                <Item.Header textAlign='left' as={Header}>
                                    <Icon name='exclamation triangle' color='red' />
                                    <Header.Content as='h1' className='content-header-error' content={this.noAccountsError.header} />
                                    <Header.Content as={Message} error className='content-subheader' content={this.noAccountsError.content} />
                                </Item.Header>                                                          
                            </Item>
                        </Grid.Column>
                        <Grid.Column floated='right' width={8}>
                            <Form.Group>
                                <Form.Button style={styles.buttonDark} onClick={() => props.history.push("/accounts", { from: props.location })} size='large' content='Go to Accounts Page' icon='user' labelPosition='right'/>
                            </Form.Group>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        );
    }

    render() {
        const { component: Component, ...rest } = this.props;
        return (
            !this.props.accountStore.loadingCache ? <Route  {...rest} render={ props => this.noAccountDetected() ? this.showRedirectButton(props) : <Component {...props} /> }  />: this.renderLoading()
        );
    }
}