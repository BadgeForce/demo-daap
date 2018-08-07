import React, {Component} from 'react'
import {
    Grid,
    Segment,
    Item,
    Header
} from 'semantic-ui-react'
import { BadgesComponent } from '../../badges'
import { ThemeContext } from '../home';


export class Badges extends Component {
    constructor(props) {
        super(props);
        const heading = 'Earned Badges';
        const descscription = `Here is your list of badges you earned, switch accounts using the menu in the top left to see any others`;
        this.state = { heading, descscription };
    }
    
    header = () => {
        if(!this.props.mobile) {
            return (
                <Header.Content as='h1' className='content-header' content={this.state.heading} />
            );
        }

        return null
    }                
    subheader = () => {
        if(!this.props.mobile) {
            return (
                <Header.Content as='h3' className='content-subheader' content={this.state.descscription} />            
            );
        }

        return null
    } 

    render() {
        return (
            <Segment style={{padding: this.props.mobile ? '1em 0em' : '4em 0em 0em 8em'}} vertical>
                <Grid container stackable>
                    <Grid.Row verticalAlign='top'>
                        {!this.props.mobile ? <Grid.Column style={{paddingBottom: this.props.mobile ? '0 !important': 'initial'}} width={4}>
                            <Item>
                                <Item.Header textAlign='left' as={Header}>
                                    {this.header()}
                                    {this.subheader()}
                                </Item.Header>                                                             
                            </Item>
                        </Grid.Column> : null}
                        <Grid.Column floated='right' width={12}>
                            <BadgesComponent />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        )
    }
}

export const BadgesWrapper = (props) => {
    return (
        <ThemeContext.Consumer>
            {theme => <Badges mobile={theme} />}
        </ThemeContext.Consumer>
    )
}