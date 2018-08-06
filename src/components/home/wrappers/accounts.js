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

export class Wrapper extends Component {
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
    header = (mobile) => {
            return (
                <Header.Content as={mobile ? 'h3' : 'h1'} className='content-header' content={this.state.heading} />
            );
    }                
    subheader = (mobile) => {
            return (
                <Header.Content as={mobile ? 'h4' : 'h3'} className='content-subheader' content={this.state.descscription} />            
            );
    } 
    render() {
        return (
            <Segment style={{padding: this.props.mobile ? '1em 0em' : '4em 0em'}} vertical>
                <Grid container stackable>
                    <Grid.Row >
                        <Grid.Column width={6}>
                            <Item>
                                <Item.Header textAlign='left' as={Header}>
                                    {this.header(this.props.mobile)}
                                    {this.subheader(this.props.mobile)}
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

export const AccountsWrapper = (props) => {
    return(
        <ThemeContext.Consumer>
            {mobile => <Wrapper mobile={mobile} />}
        </ThemeContext.Consumer>
    );
} 