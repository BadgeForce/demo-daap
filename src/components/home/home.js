import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {
    Button,
    Container,
    Grid,
    Icon,
    Image,
    Menu,
    Responsive,
    Segment,
    Sidebar,
    Visibility,
    Item,
    List,
    Header
} from 'semantic-ui-react'
import { Verifier } from '../verifier'
import {Switch, Route, Link, withRouter} from 'react-router-dom'
import headerimage from '../../images/ourproblem.png';
import logo from '../../images/LogoBadgeforce.png';

/* eslint-disable react/no-multi-comp */
/* Heads up! HomepageHeading uses inline styling, however it's not the best practice. Use CSS or styled components for
 * such things.
 */
const HomepageHeading = ({mobile}) => (
    <Grid container stackable verticalAlign='middle'>
        <Grid.Row>
            <Grid.Column >
                <Grid.Row>
                    <Item
                        style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexDirection: mobile
                            ? 'column'
                            : 'row'
                    }}>
                        <Item.Image size='large' src={headerimage}/>
                        <Item.Content verticalAlign='middle'>
                            <Item.Header className='content-header' as='h2'>
                                Official Testnet BadgeForce DAAP. Issue, View and Verify credentials with anyone!
                            </Item.Header>
                        </Item.Content>
                    </Item>
                </Grid.Row>
            </Grid.Column>
        </Grid.Row>
    </Grid>
)

HomepageHeading.propTypes = {
    mobile: PropTypes.bool
}

class TestnetStatus extends Component {
    render() {
        return (
            <Menu.Menu position='right'>
                <Menu.Item>
                    <Icon name='cubes' color='green'/>
                    <span className='menu_item_content' >
                        Network: 
                    </span>
                    <span className='menu_item_content' style={{paddingLeft: 10}}>https://testnet.badgeforce.io</span>
                </Menu.Item>
                <Menu.Item>
                    <Icon name='heartbeat' color='red'/>
                    <span className='menu_item_content' >
                        Status:
                    </span>
                    <span className='menu_item_content' style={{paddingLeft: 10}}>Operating normally</span>
                </Menu.Item>
            </Menu.Menu>
        );
    }
}

class DesktopMenu extends Component {

    render() {
        console.log(this.context);
        return (
            <Container>
                <Menu.Item active activeclassname='navbar_active_a'>
                    <Link to='/verifier'>
                        <span className='menu_item_content'>Verifier</span>    
                    </Link>
                </Menu.Item>
                <Menu.Item as='a'>
                    <span className='menu_item_content' >Issuer</span>    
                </Menu.Item>
                <Menu.Item as='a'>
                    <span className='menu_item_content' >Accounts</span>    
                </Menu.Item>
                <TestnetStatus />
            </Container>
        )
    }
}



/* Heads up!
 * Neither Semantic UI nor Semantic UI React offer a responsive navbar, however, it can be implemented easily.
 * It can be more complicated, but you can create really flexible markup.
 */
class DesktopContainer extends Component {
    state = {}

    hideFixedMenu = () => this.setState({fixed: false})
    showFixedMenu = () => this.setState({fixed: true})
    renderMenu = () => {
        return withRouter(props => <DesktopMenu {...props} />)
    }
    render() {
        const {children} = this.props
        const {fixed} = this.state

        return (
            <Responsive {...Responsive.onlyComputer}>
                <Visibility
                    once={false}
                    onBottomPassed={this.showFixedMenu}
                    onBottomPassedReverse={this.hideFixedMenu}>
                    <Segment
                        textAlign='center'
                        style={{
                        padding: '1em 0em'
                    }}
                        vertical>
                        <Menu
                            fixed={fixed
                            ? 'top'
                            : null}
                            pointing={!fixed}
                            secondary={!fixed}
                            borderless={true}
                            style={{boxShadow: this.state.fixed ? '0px 3px 5px rgba(62,99,215,0.2)' : 'none'}}
                            size='large'>
                            <Menu.Item>
                                <Image src={logo} />    
                            </ Menu.Item> 
                            <DesktopMenu />
                        </Menu>
                        <HomepageHeading />
                    </Segment>
                </Visibility>

                {children}
            </Responsive>
        )
    }
}

DesktopContainer.propTypes = {
    children: PropTypes.node
}

class MobileContainer extends Component {
    state = {}

    handlePusherClick = () => {
        const {sidebarOpened} = this.state

        if (sidebarOpened) 
            this.setState({sidebarOpened: false})
    }

    handleToggle = () => this.setState({
        sidebarOpened: !this.state.sidebarOpened
    })

    render() {
        const {children} = this.props
        const {sidebarOpened} = this.state

        return (
            <Responsive {...Responsive.onlyMobile}>
                <Sidebar.Pushable>
                    <Sidebar
                        as={Menu}
                        animation='uncover'
                        inverted
                        vertical
                        visible={sidebarOpened}>
                        <Menu.Item as='a' active>
                            Home
                        </Menu.Item>
                        <Menu.Item as='a'>Work</Menu.Item>
                        <Menu.Item as='a'>Company</Menu.Item>
                        <Menu.Item as='a'>Careers</Menu.Item>
                        <Menu.Item as='a'>Log in</Menu.Item>
                        <Menu.Item as='a'>Sign Up</Menu.Item>
                    </Sidebar>

                    <Sidebar.Pusher
                        dimmed={sidebarOpened}
                        onClick={this.handlePusherClick}
                        style={{
                        minHeight: '100vh'
                    }}>
                        <Segment
                            inverted
                            textAlign='center'
                            style={{
                            minHeight: 350,
                            padding: '1em 0em'
                        }}
                            vertical>
                            <Container>
                                <Menu inverted pointing secondary size='large'>
                                    <Menu.Item onClick={this.handleToggle}>
                                        <Icon name='sidebar'/>
                                    </Menu.Item>
                                    <Menu.Item position='right'>
                                        <Button as='a' inverted>
                                            Log in
                                        </Button>
                                        <Button
                                            as='a'
                                            inverted
                                            style={{
                                            marginLeft: '0.5em'
                                        }}>
                                            Sign Up
                                        </Button>
                                    </Menu.Item>
                                </Menu>
                            </Container>
                            <HomepageHeading mobile/>
                        </Segment>

                        {children}
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
            </Responsive>
        )
    }
}

MobileContainer.propTypes = {
    children: PropTypes.node
}

const ResponsiveContainer = ({children}) => (
    <div>
        <DesktopContainer>
            {children}
        </DesktopContainer>
        <MobileContainer>
            {children}
        </MobileContainer>
    </div>
)

ResponsiveContainer.propTypes = {
    children: PropTypes.node
}

class VerifierWrapper extends Component {
    constructor(props) {
        super(props);
        // The 3 things you need are the ''
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
                padding: '8em 0em'
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
                            <Verifier />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        )
    }
}

const HomepageLayout = () => (
    <ResponsiveContainer>
        <Switch>
            <Route exact path="/" component={this}/>
            <Route exact path="/verifier" component={VerifierWrapper}/> 
            {/* <Route path="/about" component={About} />
            <Route path="/hello" component={Hello} />
            <Route path="/books" component={Books} /> */}
        </Switch>
    </ResponsiveContainer>
)

export default HomepageLayout