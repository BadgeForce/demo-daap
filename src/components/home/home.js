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

const menutItemsLength = 8;
const menuItems = (props) => {
    return (
        [<Menu.Item key={'verifier'} active={props.location.pathname === '/verifier'}>
            <Link activestyle='navbar_active_a' to='/verifier'>
                <span className='menu_item_content'><Icon name='check' />Verifier</span>    
            </Link>
        </Menu.Item>,
        <Menu.Item key={'issuer'} active={props.location.pathname === '/issuer'}>
            <Link to='/issuer'>
                <span className='menu_item_content'><Icon name='university' />Issuer</span>    
            </Link>
        </Menu.Item>,
        <Menu.Item key={'accounts'} active={props.location.pathname === '/accounts'}>
            <Link to='/accounts'>
                <span className='menu_item_content'><Icon name='user' />Accounts</span>    
            </Link>
        </Menu.Item>,
        <Menu.Item key={'badges'} active={props.location.pathname === '/badges'}>
            <Link to='/badges'>
                <span className='menu_item_content'><Icon name='shield' />Badges</span>    
            </Link>
        </Menu.Item>,
        <TestnetStatus key={'testnetstatus'} {...props} />]
    );
}

class TestnetStatus extends Component {
    constructor(props) {
        super(props);
        this.getSideBarButton = this.getSideBarButton.bind(this);
        this.getChainURI = this.getChainURI.bind(this);
        this.getHealthStatus = this.getHealthStatus.bind(this);
        this.desktop = this.desktop.bind(this);
        this.renderMenu = this.renderMenu.bind(this);
        this.defaultItems = [   
        <Menu.Item key='testnetconn' icon={<Icon name='cubes' color='green' />} content={this.getChainURI()} />,           
            <Menu.Item key='testnetstatus' content={this.getHealthStatus()} />,
        ];
    }
    getSideBarButton() {
        return (
            <Menu.Item key='desktopnavbtn'>
                <Button circular style={styles.buttonDark} onClick={this.props.toggleSideBar} size='medium' icon={this.props.sideBarOpen ? 'close' : 'sidebar'} />
            </Menu.Item>
        );
    }
    getChainURI() {
        return (
            <span className='menu_item_content'>
                Network: https://testnet.badgeforce.io<Icon name='user' />
            </span> 
        )
    }
    getHealthStatus() {
        return (
            <Item.Content verticalAlign='middle'>
                <Item.Header className='menu_item_content' content='Status: Operating normally' icon={<Icon name='heartbeat' color='red'/>} />                    
            </Item.Content>
        );
    }
    desktop() {
        return [...this.defaultItems, this.getSideBarButton()];
    }
    renderMenu = (isMobile) => {
        return isMobile ? this.defaultItems : this.desktop();
    }
    render() {
        return (
            <ThemeContext.Consumer>
                {isMobile => this.renderMenu(isMobile)}
            </ThemeContext.Consumer>
        );
    }
}

class NavbarMenu extends Component {
    state = {active: 'issuer'}
    setActive(active) {
        this.setState({active});
    }
    render() {
        return (
                <Container fluid>
                    {menuItems({...this.props})}
                </Container>
        );
    }
}
const NavbarMenuWithRouter = withRouter(NavbarMenu)



/* Heads up!
 * Neither Semantic UI nor Semantic UI React offer a responsive navbar, however, it can be implemented easily.
 * It can be more complicated, but you can create really flexible markup. fc0dd96593394b5727d68bf21579117db6a9178e1277e25793f80eb4da1e6904
 */

export const ThemeContext = React.createContext('mobile');
class DefaultContainer extends Component {
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
        console.log("YOOO", this.props.desktop)
        return (
            <Responsive {...this.props.desktop ? Responsive.onlyComputer : Responsive.onlyTablet}>
                <Visibility
                    once={false}
                    onBottomPassed={this.showFixedMenu}
                    onBottomPassedReverse={this.hideFixedMenu}>
                    <Segment
                        textAlign='center'
                        style={{padding: '1em 0em', height: '100vh'}}
                        vertical>
                        <Menu
                            fluid widths='7'
                            fixed={fixed ? 'top': null}
                            pointing={!fixed}
                            secondary={!fixed}
                            borderless={true}
                            style={{boxShadow: this.state.fixed ? '0px 3px 5px rgba(62,99,215,0.2)' : 'none'}}
                            size='large'>
                            <Menu.Item>
                                <Image src={logo} />    
                            </ Menu.Item> 
                            <ThemeContext.Provider value={this.props.mobile}>      
                                <NavbarMenuWithRouter testnetStatusPosition='right' sideBarOpen={this.state.visible} toggleSideBar={this.toggle} />
                            </ThemeContext.Provider>      
                        </Menu>
                        <Sidebar.Pushable>
                            <Sidebar
                                className='customized-scrollbar'
                                style={{overflowX: 'hidden', height: 'inherit'}}
                                as={Menu}
                                animation='push'
                                direction='right'
                                icon='labeled'
                                vertical
                                visible={this.state.visible}
                                width='wide'
                            >             
                                <ThemeContext.Provider value={this.props.mobile}>       
                                    <AccountNavMenuItem />
                                    <TransactionNavList />
                                </ThemeContext.Provider>
                            </Sidebar>
                            <Sidebar.Pusher>
                                <HomepageHeading />
                                <ThemeContext.Provider value={this.props.mobile}>
                                    {children}
                                </ThemeContext.Provider>
                            </Sidebar.Pusher>
                        </Sidebar.Pushable>
                    </Segment>
                </Visibility>
            </Responsive>
        )
    }
}

DefaultContainer.propTypes = {
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
                        animation='push'
                        inverted
                        vertical
                        visible={sidebarOpened}
                    >
                            <NavbarMenuWithRouter testnetStatusPosition='right' sideBarOpen={this.state.visible} toggleSideBar={this.toggle} />
                    </Sidebar>

                    <Sidebar.Pusher
                        onClick={this.handlePusherClick}
                        style={{
                        minHeight: '100vh'
                    }}>
                        <Segment
                            textAlign='center'
                            style={{
                                minHeight: 350,
                                padding: '1em 0em'
                            }}
                            vertical
                            >
                            <Container>
                                <Menu pointing secondary size='large'>
                                    <Menu.Item onClick={this.handleToggle}>
                                        <Icon size='large' name='sidebar'/>
                                    </Menu.Item>
                                </Menu>
                            </Container>
                            <HomepageHeading mobile/>
                            <ThemeContext.Provider value={this.props.mobile}>
                                {children}
                            </ThemeContext.Provider>
                        </Segment>
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
        <DefaultContainer desktop={true}>
            {children}
        </DefaultContainer>
        <DefaultContainer desktop={false}>
            {children}
        </DefaultContainer>
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