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
    Header
} from 'semantic-ui-react'
import  wrappers from './wrappers';
import { AccountAuth } from '../accounts/auth';
import { AccountNavMenuItem } from '../accounts';
import { TransactionNavList } from '../transactions';
import { styles } from '../common-styles';
import { Switch, Route, Link, withRouter } from 'react-router-dom'
import { ToastContainer } from "react-toastify";
import headerimage from '../../images/ourproblem.png';
import logo from '../../images/LogoBadgeforce.png';
import 'react-toastify/dist/ReactToastify.css';

/* eslint-disable react/no-multi-comp */
/* Heads up! HomepageHeading uses inline styling, however it's not the best practice. Use CSS or styled components for
 * such things.
 */
class HomepageHeading extends Component {
    render() {
        const {mobile} = this.props;
        return (
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
        );
    }
}

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
                <Menu.Item>
                    <Button circular style={styles.buttonDark} onClick={this.props.toggleSideBar} size='medium' icon='bars' />
                </Menu.Item>
            </Menu.Menu>
        );
    }
}

class DesktopMenu extends Component {
    state = {active: 'issuer'}
    setActive(active) {
        this.setState({active});
    }
    render() {
        return (
                <Container fluid>
                    <Menu.Item active={this.props.location.pathname === '/verifier'}>
                        <Link onClick={() => this.setActive('verifier')} activestyle='navbar_active_a' to='/verifier'>
                            <span className='menu_item_content'><Icon name='check' />Verifier</span>    
                        </Link>
                    </Menu.Item>
                    <Menu.Item active={this.props.location.pathname === '/issuer'}>
                        <Link onClick={() => this.setActive('issuer')} to='/issuer'>
                            <span className='menu_item_content'><Icon name='university' />Issuer</span>    
                        </Link>
                    </Menu.Item>
                    <Menu.Item active={this.props.location.pathname === '/accounts'}>
                        <Link onClick={() => this.setActive('accounts')} to='/accounts'>
                            <span className='menu_item_content'><Icon name='user' />Accounts</span>    
                        </Link>
                    </Menu.Item>
                    <Menu.Item active={this.props.location.pathname === '/badges'}>
                        <Link onClick={() => this.setActive('badges')} to='/badges'>
                            <span className='menu_item_content'><Icon name='shield' />Badges</span>    
                        </Link>
                    </Menu.Item>
                    <TestnetStatus {...this.props} />
                </Container>
                
        );
    }
}

const DesktopMenuWithRouter = withRouter(DesktopMenu)



/* Heads up!
 * Neither Semantic UI nor Semantic UI React offer a responsive navbar, however, it can be implemented easily.
 * It can be more complicated, but you can create really flexible markup. fc0dd96593394b5727d68bf21579117db6a9178e1277e25793f80eb4da1e6904
 */

export const ThemeContext = React.createContext('mobile');
class DesktopContainer extends Component {
    static propTypes = {
        match: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired
    }
    constructor(props) {
        super(props);
        this.state = {visible: false, active: 'verifier', fixed: false}
        this.toggle = this.toggle.bind(this);
    }
    toggle() {
        this.setState({visible: !this.state.visible})
    }
    hideFixedMenu = () => this.setState({fixed: false})
    showFixedMenu = () => this.setState({fixed: true})
    render() {
        const {children} = this.props
        const {fixed} = this.state
        return (
            <Sidebar.Pushable>
                <Sidebar
                    as={Menu}
                    animation='overlay'
                    direction='right'
                    icon='labeled'
                    vertical
                    visible={this.state.visible}
                    width='very wide'
                >                    
                    <Menu.Item style={styles.navMenuHeader} onClick={this.toggle}>
                        <Item.Header>
                            <Header style={styles.navMenuHeader} as={'h4'}>
                                <Icon name='close' />
                                <Header.Content>
                                    Close
                                </Header.Content>
                            </Header>
                        </Item.Header>
                    </Menu.Item>
                    <AccountNavMenuItem mobile={this.props.mobile} />
                    <TransactionNavList />
                </Sidebar>
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
                                fixed={fixed ? 'top': null}
                                pointing={!fixed}
                                secondary={!fixed}
                                borderless={true}
                                style={{boxShadow: this.state.fixed ? '0px 3px 5px rgba(62,99,215,0.2)' : 'none'}}
                                size='large'>
                                <Menu.Item>
                                    <Image src={logo} />    
                                </ Menu.Item> 
                                <DesktopMenuWithRouter toggleSideBar={this.toggle} />
                            </Menu>
                            <HomepageHeading />
                        </Segment>
                    </Visibility>
                    <ThemeContext.Provider value={this.props.mobile}>
                        {children}
                    </ThemeContext.Provider>
                </Responsive>
            </Sidebar.Pushable>
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

const HomepageLayout = () => (
    <ResponsiveContainer>
        <ToastContainer />
        <Switch>
            <Route exact path="/" component={wrappers.Verifier}/>
            <Route path="/verifier" component={wrappers.Verifier}/>
            <Route path="/accounts" component={wrappers.Accounts}/>
            <AccountAuth path="/issuer" component={wrappers.Issuer}/>
            <AccountAuth path="/badges" component={wrappers.Badges}/>
            {/* <Route path="/about" component={About} />
            <Route path="/hello" component={Hello} />
            <Route path="/books" component={Books} /> */}
        </Switch>
    </ResponsiveContainer>
)

export default HomepageLayout