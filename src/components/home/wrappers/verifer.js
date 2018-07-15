import React, {Component} from 'react'
import {
    Grid,
    Icon,
    Segment,
    Item,
    List,
    Header
} from 'semantic-ui-react'
import { VerifierComponent } from '../../verifier'

export class VerifierWrapper extends Component {
    constructor(props) {
        super(props);
        const heading = 'Verifier';
        const descscription = `The BadgeForce Verifier allows you to verify the authenticity of any credential issued using the BadgeForce platform. Verification is done in seconds.`;
        const requrements = [
            {heading:'Recipient publickey', icon:'user', info: 'This is is the public address of the user who owns the credential'},
            {heading:'Credential Name', icon:'shield', info: 'The name of the credential you want to verify, be sure the spelling is exactly the same'},
            {heading:'Institution ID', icon:'university', info: 'This is the ID assigned to the Issuer.'},
        ]
        this.state = { heading, descscription, requrements };

        this.styles = {
            requirementHeading: {
                fontWeight: 'bold',
            },
        }
    }
    renderRequirements() {
        return (
            <List as='ol'>
                {this.state.requrements.map((requirement, i) => {
                    return <List.Item as='li' key={i}>
                        <span className='content-header'>
                            <Icon name={requirement.icon} />{requirement.heading}:&emsp;
                        </span>
                        <span className='content-text'>{requirement.info}</span>
                    </List.Item>
                })}
            </List>
        );
    }
    render() {
        return (
            <Segment style={{
                padding: '4em 0em'
            }} vertical>
                <Grid container stackable>
                    <Grid.Row verticalAlign='middle' >
                        <Grid.Column width={6}>
                            <Item>
                                <Item.Header textAlign='left' as={Header}>
                                    <Header.Content as='h1' className='content-header' content={this.state.heading} />
                                    <Header.Content as='h3' className='content-subheader' content={this.state.descscription} />
                                </Item.Header>                                    
                                <Item.Description>
                                    {this.renderRequirements()}   
                                </Item.Description>                            
                            </Item>
                            {/* <Header className='content-header' as='h3' content='Verifier' />
                            <p className='content-text'>
                                We can give your company superpowers to do things that they never thought
                                possible. Let us delight your customers and empower your needs... through pure
                                data analytics.
                            </p> */}
                        </Grid.Column>
                        <Grid.Column floated='right' width={8}>
                            <VerifierComponent />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        )
    }
}