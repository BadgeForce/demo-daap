import React, {Component} from 'react'
import {
    Grid,
    Segment,
    Item,
    Header
} from 'semantic-ui-react'
import { BadgesComponent } from '../../badges'

export class BadgesWrapper extends Component {
    constructor(props) {
        super(props);
        const heading = 'Earned Badges';
        const descscription = `Here is your list of badges you earned, switch accounts using the menu in the top left to see any others`;
        this.state = { heading, descscription };
    }
    
    render() {
        return (
            <Segment style={{padding: '4em 0em'}} vertical>
                <Grid container stackable>
                    <Grid.Row verticalAlign='top'>
                        <Grid.Column width={4}>
                            <Item>
                                <Item.Header textAlign='left' as={Header}>
                                    <Header.Content as='h1' className='content-header' content={this.state.heading} />
                                    <Header.Content as='h3' className='content-subheader' content={this.state.descscription} />
                                </Item.Header>                                                             
                            </Item>
                        </Grid.Column>
                        <Grid.Column floated='right' width={12}>
                            <BadgesComponent />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        )
    }
}