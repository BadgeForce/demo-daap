import PropTypes from 'prop-types'
import React, {Component} from 'react'
import _ from 'lodash'
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
import { ChainRestConfig } from '../../badgeforcejs-lib/config';
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
    constructor(props) {
        super(props);
        this.state = {
            networkURI: 'https://testnet.badgeforce.io',
            status: 'Operating normally'
        }
    }
    render() {
        const {mobile, tablet} = this.props;
        return (
            <Grid container stackable verticalAlign='middle'>
                <Grid.Row>
                    <Grid.Column>
                        <Grid.Row>
                            <Item
                                style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexDirection: mobile || tablet
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
    mobile: PropTypes.bool, 
    tablet: PropTypes.bool
}

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
        <Menu.Item link key={'badges'} active={props.location.pathname === '/badges'}>
            <Link to='/badges'>
                <span className='menu_item_content'><Icon name='shield' />Badges</span>    
            </Link>
        </Menu.Item>]
    );
}

class TestnetStatus extends Component {
    constructor(props) {
        super(props);

        this.state = { 
            overlayFixed: false, 
            status: '', 
            networkURI:  ''
        }

        this.normal = 'Operating normally';

        this.defaultItems = [   
            <Menu.Item key='testnetstatus' icon={<Icon name='heartbeat' color='red'/>} content={this.getHealthStatus()} />,
            <Menu.Item key='testnetconn' icon={<Icon name='cubes' color='green' />} content={this.getChainURI()} />,           
        ];
    }
    componentDidMount() {
        this.setState({
            status: this.normal,
            networkURI: ChainRestConfig.base
        })    
    }
    stickOverlay = () => this.setState({ overlayFixed: true });
    unStickOverlay = () => this.setState({ overlayFixed: false });
    handleOverlayRef = (c) => {
        const { overlayRect } = this.state
        if (!overlayRect) {
            this.setState({ overlayRect: _.pick(c.getBoundingClientRect(), 'height', 'width') })
        }
    }
    getChainURI = () => {
        return (
            <span className='menu_item_content'>
                {`Network: ${this.state.networkURI}`}
            </span> 
        )
    }
    getHealthStatus = () => {
        return (
            <span className='menu_item_content'>
                {`Status: ${this.state.status}`}
            </span> 
        );
    }
    desktop = () => {
        const {overlayFixed} = this.state;
        return (
            <div>
                <Visibility
                    once={false}
                    onTopPassed={this.stickOverlay}
                    onTopVisible={this.unStickOverlay}
                    style={{height: 0, width: 0}} />
                <div ref={this.handleOverlayRef} style={overlayFixed ? fixedOverlayStyle : overlayStyle}>
                    <Segment compact style={fixedOverlayMenuStyle}>
                        <Header as={'h5'}>
                            <Header.Content 
                            className='menu_item_content' 
                            style={{
                                display: 'flex', 
                                flexDirection: 'column',
                                alignItems: 'baseline',
                            }}>
                                <Image src={logo} />
                                <span><Icon name='cubes' color='green' />Network: {this.state.networkURI}</span>
                                <span><Icon name='heartbeat' color='red'/>Status: {this.state.status}</span>
                            </Header.Content>
                        </Header>
                    </Segment> 
                </div>
            </div>
        );
    }
    render() {
        switch (this.props.showStatus) {
            case 'desktop':
                return this.desktop();
            case 'tablet':
                return this.defaultItems;
            case 'mobile':
                return this.defaultItems;
            default: 
                return this.desktop();
        }
    }
}

class NavbarMenu extends Component {
    state = {active: 'issuer'}
    setActive(active) {
        this.setState({active});
    }
    
    getSideBarBtn = () => {
        return (
            <Menu.Item key='desktopnavbtn'>
                <Button circular style={styles.buttonDark} onClick={this.props.toggleSideBar} size='medium' icon={this.props.sideBarOpen ? 'close' : 'sidebar'} />
            </Menu.Item>
        );
    }

    getTestNetStatus = () => {
        return (
            <Menu.Item key='tstatus'>
                <TestnetStatus {...this.props} />
            </Menu.Item>
        );
    }

    render() {
        const items = menuItems({...this.props});        
        return (
            <Container fluid>
                {items}
                {!this.props.mobile ? this.getSideBarBtn() : this.getTestNetStatus()}
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
        this.state = {
            visible: false,
            menuFixed: false
        }
        this.toggle = this.toggle.bind(this);
    }
    toggle = () => this.setState({visible: !this.state.visible});
    stickTopMenu = () => this.setState({ menuFixed: true });
    unStickTopMenu = () => this.setState({ menuFixed: false });
    
    render() {
        const {children} = this.props
        const { menuFixed } = this.state
        return (
            <Responsive {...this.props.desktop ? Responsive.onlyComputer : Responsive.onlyTablet}>
                <Visibility
                    onBottomPassed={this.stickTopMenu}
                    onBottomVisible={this.unStickTopMenu}
                    once={false}>
                    <Menu
                        fluid widths='5'
                        borderless
                        fixed={menuFixed ? 'top' : null}
                        style={menuFixed ? fixedMenuStyle : menuStyle}
                        size='huge'> 
                        <ThemeContext.Provider value={this.props.mobile}>      
                            <NavbarMenuWithRouter {...this.props} sideBarOpen={this.state.visible} toggleSideBar={this.toggle} />
                        </ThemeContext.Provider>     
                    </Menu>
                </Visibility>
                <TestnetStatus showStatus={this.props.showStatus}/>
                <Sidebar.Pushable>
                    <Sidebar
                        className='customized-scrollbar'
                        style={{overflowX: 'hidden', boxShadow: 'none', border: 'none'}}
                        as={Menu}
                        animation='overlay'
                        direction='right'
                        icon='labeled'
                        vertical
                        visible={this.state.visible}
                        width='wide'>             
                        <ThemeContext.Provider value={this.props.mobile}>       
                            <AccountNavMenuItem />
                            <TransactionNavList />
                        </ThemeContext.Provider>
                    </Sidebar>
                    <Sidebar.Pusher>
                        <div>
                            <HomepageHeading />
                            <ThemeContext.Provider value={this.props.mobile || this.props.tablet}>                                    
                                {children}
                            </ThemeContext.Provider>
                        </div>
                    </Sidebar.Pusher>
                </Sidebar.Pushable>
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
                        style={{overflowX: 'hidden', height: 'inherit'}}
                        visible={sidebarOpened}
                    >
                            <NavbarMenuWithRouter {...this.props} testnetStatusPosition='right' sideBarOpen={this.state.visible} toggleSideBar={this.toggle} />
                    </Sidebar>

                    <Sidebar.Pusher onClick={this.handlePusherClick}>
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
        <DefaultContainer showStatus={'desktop'} desktop={true}>
            {children}
        </DefaultContainer>
        <DefaultContainer showStatus={'tablet'} tablet desktop={false}>
            {children}
        </DefaultContainer>
        <MobileContainer mobile showStatus={'mobile'}>
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
        </Switch>
    </ResponsiveContainer>
)

const menuStyle = {
    fontWeight: 'bold',
    color: '#337ab7',
    border: 'none',
    borderRadius: 0,
    boxShadow: 'none',
    transition: 'box-shadow .5s ease, padding .5s ease',
}

const fixedMenuStyle = {
    border: '1px solid #ddd',
    boxShadow: '0px 3px 5px rgba(62,99,215,0.2)',
    transition: 'box-shadow .5s ease',
}

const overlayStyle = {
    height: 0,
    left: 20,
    margin: '0em 3em 1em 0em',
}

const fixedOverlayStyle = {
    ...overlayStyle,
    position: 'fixed',
    top: '40px',
    zIndex: 10,
}

const fixedOverlayMenuStyle = {
    ...overlayStyle,
    position: 'relative',
    right: 0,
    top: '40px',
}

export default HomepageLayout