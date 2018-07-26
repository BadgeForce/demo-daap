import React, { Component } from 'react';
import { List, Header, Menu, Dropdown, Grid, Button, Item, Loader, Popup } from 'semantic-ui-react'
import { Credential, sleep } from '../verifier';
import { ProtoDecoder } from '../../badgeforcejs-lib/badgeforce_base' 
import {observer, inject } from 'mobx-react';
import { reaction } from 'mobx';
import { Toaster } from '../utils/toaster';
import { toast, ToastContainer } from 'react-toastify';
import { ThemeContext } from '../home/home';
import { styles } from '../common-styles';
import TextTruncate from 'react-text-truncate';


import logo from '../../images/LogoBadgeforce.png';
const QRCode = require('qrcode.react');

const moment = require('moment');
@observer
export class CompactInfoList extends Component {
    badges = this.props.badges;
    state = {active: this.props.badges[0].badge}
    setActive = (e, {value}) => {
        const { badge, key } = this.badges.filter( ({ key }) => key === value).shift();
        this.props.setActive(badge, key);
        this.setState({active: badge});
    }
    getOption = (badge, key) =>  {
        return { key: badge.coreInfo.name, text: badge.coreInfo.name, value: key }
    }
    getList = () => {
        const options = this.badges.map((data, i) => {
            const { badge, key } = data;
            return this.getOption(badge, key)
        });
        return (
            <Grid.Row>
                <Header>
                    <Header.Content as='h1' className='content-header' content={this.state.active.coreInfo.name} />
                </Header>
                <Dropdown
                    style={{backgroundColor: styles.buttonLight.backgroundColor}}
                    scrolling
                    autoComplete='on'
                    fluid
                    options={options}
                    onChange={this.setActive}
                    search
                    selection
                    placeholder='Search by badge name or issuer public key'
                />
            </Grid.Row>
        );
    }
    render() {   
        return this.badges.length > 0 ? this.getList() : null;
    }
}

@inject('accountStore')
@inject('badgeStore')
@observer
export class Badges extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: null,
            key: null,
            loading: {toggle: false, message: ''},
            badges: this.props.badgeStore.cache,
            errorLoadingBadges: {toggle: null, message: null}
        }
        this.downloadQRC = this.downloadQRC.bind(this);
        this.qrc = React.createRef();
        this.accountStore = this.props.accountStore;
        this.refresh = this.refresh.bind(this);
        this.doneLoading = this.doneLoading.bind(this);
        this.accountMismathch = this.accountMismathch.bind(this);
        this.accountChangeReaction = this.accountChangeReaction.bind(this);
        this.disposeAccountChange = null;
        

    }
    doneLoading(newCache, error) {
        this.setState({
            loading: { toggle: false, message: ''}, 
            badges: newCache,
            active: newCache.length > 0 ? newCache[0].badge : null,
            key: newCache.length > 0 ? newCache[0].key : null,
            errorLoadingBadges: {toggle: error !== null, message: error ? error.message : null}
        });
    }
    
    accountChangeReaction() {
        return {
            prop: () => this.props.accountStore.current, 
            action: async current => {
                this.setState({loading: {toggle: true, message: 'Account change detected . . .'}})
                await sleep(1);
                await this.props.badgeStore.setAccount(this.props.accountStore.current, this.doneLoading);
            }
        };
    }

    async componentDidMount() {
        const accountChange = this.accountChangeReaction();
        this.disposeAccountChange = reaction(accountChange.prop, accountChange.action);

        try {
            if(this.accountMismathch()) {
                this.setState({loading: {toggle: true, message: 'Check for badges on blockchain . . .'}})
                await sleep(1); 
                await this.props.badgeStore.setAccount(this.props.accountStore.current, this.doneLoading);
            } else if(this.props.badgeStore.cache.length === 0 ) {
                this.setState({loading: {toggle: true, message: 'No badges found, polling blockchain . . .'}})
                await sleep(1); 
                await this.props.badgeStore.poll(this.doneLoading);
            } else {
                this.setState({loading: { toggle: false, message: ''}, badges: this.props.badgeStore.cache});
            }
        } catch (error) {
            Toaster.notify("Could not load badges, click refresh button to try again", toast.TYPE.ERROR);
            this.setState({loading: { toggle: false, message: ''}, badges: []});
        }
    }

    accountMismathch() {
        if(this.props.accountStore.current === null) {
            throw new Error("No account detected");
        }
        
        const badgeStoreAccount = this.props.badgeStore.account;
        const accountNotMissing = badgeStoreAccount !== null || badgeStoreAccount !== undefined;
        if(accountNotMissing) {
            return true;
        } 

        return this.props.accountStore.current.getPublicKey() === badgeStoreAccount.getPublicKey();
    }

    componentWillUnmount() {
        this.disposeAccountChange()
    }

    async refresh() {
        this.setState({
            loading: {toggle: true, message: 'Checking blockchain for new badges . . .'},
            badges: [],
            active: null, 
            key: null
        })
        await this.props.badgeStore.poll(this.doneLoading);
        await sleep(1);
    }
    renderBadges() {
        return (
            <Grid.Row>
                <Grid.Column width={4} >
                    <CompactInfoList badges={this.state.badges} setActive={(active, key) => this.setState({active, key})} />
                </Grid.Column> 
                <Grid.Column style={{height: '100vh'}} computer={12} mobile={4} tablet={12}>
                    {this.renderActive()}
                </Grid.Column>  
            </Grid.Row>
        );
    }
    downloadQRC() {
        const dataStr = "data:text/json;charset=utf-8," + JSON.stringify({data: ProtoDecoder.encodedQRDegree(this.state.active)});
        const link = document.createElement("a");
        link.href = dataStr;
        link.download = `${this.state.active.coreInfo.name}.bfac`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    renderActive() {
        // const qrCodeVal = JSON.stringify({data: ProtoDecoder.encodedQRStorageHash(this.state.key)});
        // console.log(qrCodeVal);
        const badge = this.state.active || this.state.badges[0].badge;
        const key = this.state.key || this.state.badges[0].key;
        if(badge && key) {
            return (
                <div style={{marginTop: 10}}>
                    <Credential full={true} data={badge.coreInfo} signature={badge.signature} ipfs={key}/>
                    {/* <QRCode id='qrcode' size={160} style={{height: 'auto', width: 'auto'}} value={qrCodeVal} /> */}
                    <Button style={{display: 'flex', alignSelf: 'flex-start'}} color='blue' onClick={this.downloadQRC} size='large' content='download credential file' icon='download' labelPosition='right'/>
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
        const content = this.state.errorLoadingBadges.toggle ? this.state.errorLoadingBadges.message : 'No Badges Found For This Account';
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
                <ToastContainer autoClose={5000} />
                <Loader active={this.state.loading.toggle} indeterminate>{this.state.loading.message}</Loader>
                <Grid.Row style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Button circular color='grey' onClick={this.refresh} size='large' icon='refresh'/>
                </Grid.Row>
                {this.state.badges.length === 0 ? <Header style={styles.navMenuHeader} content={!this.state.loading.toggle && this.state.badges.length === 0 ? this.renderHeader() : null} as='h4' /> : null} 
                {!this.state.loading.toggle && this.state.badges.length > 0 ? this.renderBadges() : null}    
            </Grid.Column>
        )
    }
}

export const BadgesComponent = (props) => {
    return (
        <ThemeContext.Consumer>
            {theme => <Badges mobile={theme} />}
        </ThemeContext.Consumer>
    )
}