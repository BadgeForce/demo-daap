import React, {Component} from 'react'
import {
    Grid,
    Icon,
    Segment,
    Item,
    Header
} from 'semantic-ui-react'
import Accounts from '../../accounts';
import { ThemeContext } from '../home';

export const AccountsComponent = (props) => {
    return (
        <ThemeContext.Consumer>
            {theme => <Accounts mobile={theme} />}
        </ThemeContext.Consumer>
    )
}

export class AccountsWrapper extends Component {
    constructor(props) {
        super(props);
        const heading = 'Accounts';
        const descscription = `Manage your accounts, create and switch between them`;
        this.state = { heading, descscription };

        this.styles = {
            requirementHeading: {
                fontWeight: 'bold',
            },
        }
    }
    render() {
        return (
            <Segment style={{
                padding: '4em 0em'
            }} vertical>
                <Grid container stackable>
                    <Grid.Row >
                        <Grid.Column width={6}>
                            <Item>
                                <Item.Header textAlign='left' as={Header}>
                                    <Header.Content as='h1' className='content-header' content={this.state.heading} />
                                    <Header.Content as='h3' className='content-subheader' content={this.state.descscription} />
                                </Item.Header>                                                          
                            </Item>
                        </Grid.Column>
                        <Grid.Column floated='right' width={8}>
                            <AccountsComponent />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        )
    }
}