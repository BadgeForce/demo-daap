import React, {Component} from 'react'
import {
    Button,
    Grid,
    Segment,
    Item,
    Header,
    Dimmer,
    Loader,
    Divider
} from 'semantic-ui-react'
import { styles } from '../common-styles';
import { ThemeContext } from './home';
import {observer, inject} from 'mobx-react';
import headerimage from '../../images/ourproblem.png';
import 'react-toastify/dist/ReactToastify.css';

@inject('accountStore')
@observer
class GetStarted extends Component {

    redirect = (path) => {
        this.props.history.push(path, { from: this.props.location, redirect: true })
    }

    createAccountBtn = () => {
        return(
            <Button
                style={styles.buttonDark} 
                onClick={() => this.redirect('/accounts')} 
                size='huge' 
                icon='rocket'
                content='Get started by creating an account'
                labelPosition='right'/>
        );
    }

    options = () => {
        return (
            <Header.Content style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Button.Group vertical={this.props.mobile}>
                    <Button size='huge' 
                        icon='check'
                        labelPosition='right' 
                        style={styles.buttonReallyDarkNoBorder} 
                        onClick={() => this.redirect('/verifier')} content='Verify a credential'  />
                    <Button size='huge' 
                        icon='shield'
                        labelPosition='right' 
                        style={styles.buttonReallyDarkNoBorder} 
                        onClick={() => this.redirect('/issuer')} content='Issue a credential' />
                    <Button size='huge' 
                        icon='user'
                        labelPosition='right' 
                        style={styles.buttonReallyDarkNoBorder} onClick={() => this.redirect('/accounts')} 
                        content='Manage your accounts' />
                    <Button size='huge' 
                        icon='shield'
                        labelPosition='right' 
                        style={styles.buttonReallyDarkNoBorder} onClick={() => this.redirect('/badges')} 
                        content='View your badges' />
                    </Button.Group>
            </Header.Content>
        );
    }

    renderLoading() {
        return (
            <Dimmer active inverted>
                <Loader inverted>Loading</Loader>
            </Dimmer>
        );
    }

    renderAction = () => {
        console.log(this.props.accountStore.current)
        if(this.props.accountStore.current !== null) {
            return this.options();
        } else {
            return this.createAccountBtn();
        }
    }

    render() {
        const {mobile, tablet} = this.props;
        return (
            <Grid style={{margin: 0}} container stackable verticalAlign='middle'>
            <Grid.Row>
                <Grid.Column>
                    <Grid.Row>
                        <Item
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: mobile || tablet
                                    ? 'column'
                                    : 'row',
                                justifyContent: 'center'
                            }}>                  
                            <Item.Image size='medium' src={headerimage}/>
                            <Item.Header>
                                    <Header.Content style={styles.contentHeaderHome} as={mobile ? 'h2' : 'h1'}>
                                        Welcome to the BadgeForce Blockchain
                                    </Header.Content>
                                    <Header.Content style={styles.contentHeaderHome} as={mobile ? 'h2' : 'h1'}>
                                        Credential Portal
                                    </Header.Content>
                                    <Header.Content style={styles.contentHeaderHome} as={mobile ? 'h3' : 'h2'}>
                                        Issue, Verify and Consume tamper proof credentials!
                                    </Header.Content>
                                    <Header.Content as={mobile ? 'h4' : 'h3'} className='content-header'>
                                        {this.props.accountStore.loadingCache ? this.renderLoading() : this.renderAction()}
                                    </Header.Content>
                            </Item.Header>
                        </Item>
                    </Grid.Row>
                </Grid.Column>
            </Grid.Row>
        </Grid>
        );
    }
}

const Features = (props) => {
    const items = [
        'Issue tamper proof verifiable credentials',
        'Verify credentials instantly without compromising security, using the latest encryption and digital signature techiniques',
        'View all your earned credentials in one place',
        'Credential portability allows you to share your earned credentials with anyone instantly',
        'Identity and privacy',
        'Manage all your accounts and identity keypairs',
    ]
    return (
        <Item.Group>
            {items.map((item, i) => {
                return (
                    <Item key={i} style={{margin: 0}}>
                        <Item.Content style={{...styles.badge.fullCard.contentHeader, alignSelf: 'baseline', textAlign: 'left'}} content={item} />
                        <Divider />
                    </Item>
                );
            })}
        </Item.Group>
    );
}

class Home extends Component {
    render() {
        return (
            <Segment style={{
                padding: '4em 0em',
                justifyContent: 'center',
                height: '100vh'
            }} vertical>
                {<GetStarted {...this.props} />}
            </Segment>
        )
    }
}

export const HomeComponent = (props) => {
    return (
        <ThemeContext.Consumer>
            {theme => <Home {...props} mobile={theme} />}
        </ThemeContext.Consumer>
    )
}