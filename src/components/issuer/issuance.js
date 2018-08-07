import React, { Component } from 'react';
import { Header, Dropdown, Grid, Button, Loader, Popup, Message } from 'semantic-ui-react'
import { Credential, Issuance, sleep } from '../verifier';
import { inject } from 'mobx-react';
import { reaction } from 'mobx';
import { ThemeContext } from '../home/home';
import { styles } from '../common-styles';
import TextTruncate from 'react-text-truncate';
const Fuse = require('fuse.js');

export class CompactInfoList extends Component {
    issuances = this.props.issuances;
    state = {active: this.props.issuances[0]}

    searchOptions = {keys: ['name', 'recipient']}
    setActive = (e, {value}) => {
        const issuance = this.issuances.filter( ({ id }) => id === value).shift();
        this.props.setActive(issuance);
        this.setState({active: issuance.id});
    }

    getOption = (name, recipient, key) =>  {
        return { key, text: name, value: key, recipient, name }
    }

    search = (options, query) => new Fuse(options, this.searchOptions).search(query);

    getList = () => {
        const options = this.issuances.map(data => this.getOption(data.badgeName, data.recipient, data.id))
        const { badgeName } = this.state.active;
        return (
            <Grid.Row>
                <Header>
                    <Header.Content as='h1' className='content-header' content={badgeName} />
                </Header>
                <Dropdown
                    style={{backgroundColor: styles.buttonLight.backgroundColor}}
                    scrolling
                    autoComplete='on'
                    fluid
                    options={options}
                    onChange={this.setActive}
                    search={this.search}
                    noResultsMessage='No issuances found matching search input'
                    selection
                    placeholder='Search by badge name or recipient public key'
                />
            </Grid.Row>
        );
    }
    render() {   
        return this.issuances.length > 0 ? this.getList() : null;
    }
}

@inject('accountStore')
export class Issuances extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: null,
            issuances: [],
            loading: {toggle: false, message: ''},
            errorLoadingIssuances: {toggle: null, message: null}
        }
        this.accountStore = this.props.accountStore;
        this.refresh = this.refresh.bind(this);
        this.setActive = this.setActive.bind(this);
        this.accountChangeReaction = this.accountChangeReaction.bind(this);
        this.disposeAccountChange = null;
    }
    
    accountChangeReaction() {
        return {
            prop: () => this.props.accountStore.current, 
            action: async current => {
                // await this.loadIssuances();
            }
        };
    }

    async loadIssuances() {
        this.setState({issuances: [],active: null, key: null, loading: {toggle: true, message: 'Loading Issuances'}});
        // try {
        //     const issuances = await this.props.accountStore.current.loadIssuances();
        //     this.setState({issuances, loading: {toggle: false, message: ''}});
        // } catch (error) {
        //     console.log(error);
        //     this.setState({loading: {toggle: false, message: ''}});
        // }
        this.setState({loading: {toggle: false, message: ''}});
    }

    async componentDidMount() {
        // await this.loadIssuances();
        const accountChange = this.accountChangeReaction();
        this.disposeAccountChange = reaction(accountChange.prop, accountChange.action);
    }

    async refresh() {
        this.setState({
            loading: {toggle: true, message: 'Checking blockchain for new issuance\'s . . .'},
            issuances: [],
            active: null, 
            key: null
        });
        await this.loadIssuances();
        await sleep(1);
    }

    setActive(active) {
        this.setState({active})
    }
    renderIssuances() {
        return (
            <Grid.Row>
                <Grid.Column width={4} >
                    <CompactInfoList issuances={this.state.issuances} setActive={this.setActive} />
                </Grid.Column> 
                <Grid.Column style={{height: '100vh'}} computer={12} mobile={4} tablet={12}>
                    {this.renderActive()}

                </Grid.Column>  
            </Grid.Row>
        );
    }
    renderActive() {
        const { id, issuance, degree } = this.state.active || this.state.issuances[0];
        if(id) {
            return (
                <div style={{marginTop: 10}}>
                    <Credential verifyImmediate={true} showactions={true} issuance={issuance} degree={degree} full={true} data={degree.coreInfo} signature={degree.signature} ipfs={id}/>
                    <Issuance data={issuance} />
                </div>
            );
        } else {
            return null
        }
    }

    truncate(data, id) {
        console.log(data)
        return (
            <TextTruncate
                line={1}
                truncateText="…"
                text={data}
                textTruncateChild={<a href='' onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(id).click()
                }} >more</a>}
            />
        );
    }

    getPopUp(key, id) {
        return (
            <Popup content={key} trigger={<a id={id} />} hideOnScroll on='click' position='top center' />
        );
    }
    renderHeader() {
        const content = this.state.errorLoadingIssuances.toggle ? this.state.errorLoadingIssuances.message : 'No Credentials Issued From This Account';
        return (
            <Header.Content className='content-header'>
                {this.getPopUp(content, 'header-public-key')}
                {this.truncate(content, 'header-public-key')}
            </Header.Content>
        );
    }
    render() {
        return (
            <Grid.Column>
                <Loader active={this.state.loading.toggle} indeterminate content={this.state.loading.message} style={styles.navMenuHeader} />} />
                <Grid.Row style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Button circular color='grey' onClick={this.refresh} size='large' icon='refresh'/>
                </Grid.Row>
                {this.state.issuances.length === 0 && !this.state.loading ? <Message header='Issuances could not be found or loaded' content='Refresh to try again' warning /> : null}
                {/* {this.state.issuances.length === 0 ? <Header style={styles.navMenuHeader} content={!this.state.loading.toggle && this.state.issuances.length === 0 ? this.renderHeader() : null} as='h4' /> : null}  */}
                {!this.state.loading.toggle && this.state.issuances.length > 0 ? this.renderIssuances() : null}
            </Grid.Column>
        )
    }
}

export const IssuancesComponent = (props) => {
    return (
        <ThemeContext.Consumer>
            {theme => <Issuances mobile={theme} />}
        </ThemeContext.Consumer>
    )
}