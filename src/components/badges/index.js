import React, { Component } from 'react';
import { Header, Dropdown, Grid, Button, Loader, Popup, Icon } from 'semantic-ui-react'
import { Credential, sleep } from '../verifier';
import { ProtoDecoder } from '../../badgeforcejs-lib/badgeforce_base' 
import {observer, inject } from 'mobx-react';
import { reaction } from 'mobx';
import { Toaster } from '../utils/toaster';
import { toast, ToastContainer } from 'react-toastify';
import { ThemeContext } from '../home/home';
import { styles } from '../common-styles';
import TextTruncate from 'react-text-truncate';
import Slider from "react-slick";

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const QRCode = require('qrcode.react');
const moment = require('moment');
const Fuse = require('fuse.js');

function PrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div className={className} style={{ ...style}} onClick={onClick}>
            <Button syle={styles.buttonDarkNoBorder} circular icon='chevron left' onClick={onClick} />
        </div>
    );
}

function NextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div className={className} style={{ ...style}} onClick={onClick}>
            <Button syle={styles.buttonDarkNoBorder} circular icon='chevron right' onClick={onClick} />
        </div>
    );
}
  
class CustomSlide extends Component {
    render() {
        const { index, ...props } = this.props;
        return (
            <Grid.Column {...props} style={{padding: 25}}>
                <Credential 
                    full={true} 
                    data={this.props.badge.coreInfo}
                    degree={this.props.badge}
                    signature={this.props.badge.signature} 
                    ipfs={this.props.ipfs}
                    qrcodeAction={false}
                    verifyAction
                    downloadAction
                    />
                {/* <QRCode id='qrcode' size={160} style={{height: 'auto', width: 'auto'}} value={qrCodeVal} /> */}
            </Grid.Column>
        );
    }
  }
export class BadgeCarousell extends Component {
    firstSliderSettings = {
        slidesToShow: 1,
        slidesToScroll: 1,
    }
    constructor(props) {
        super(props);
        this.state = {
          nav1: null,
          settings: this.firstSliderSettings,
        };
    }
    
    componentDidMount() {
        console.log(this.props.badges)
        const {settings} = this.state;
        if(!this.props.mobile) {
            settings['nextArrow'] = <NextArrow />;
            settings['prevArrow'] = <PrevArrow />;
        }
        this.setState({
            nav1: this.slider1,
            settings: settings
        });
    }

    render() {
        return (
            <Slider
                asNavFor={this.state.nav2}
                ref={slider => (this.slider1 = slider)}
                {...this.state.settings}
            >
                {this.props.badges.map(({badge, key}, i) => {
                    console.log(badge, key)
                    return (
                        <CustomSlide {...this.props} key={i} index={i} ipfs={key} badge={badge}/>
                    );
                })}
            </Slider>
        );
    }
}

@observer
export class CompactInfoList extends Component {
    firstSliderSettings = {
        slidesToShow: 1,
        slidesToScroll: 1,
    }
    searchOptions = {keys: ['name', 'recipient']}
    badges = this.props.badges;
    state = {settings: this.firstSliderSettings, nav1: null}

    componentDidMount() {
        const {settings} = this.state;
        if(!this.props.mobile) {
            settings['nextArrow'] = <NextArrow />;
            settings['prevArrow'] = <PrevArrow />;
        }
        this.setState({
            nav1: this.slider1,
            settings: settings
        });
        console.log(this.slider1)
        
    }

    setActive = (e, {value}) => {
        const index = this.state.nav1.props.children.map(({props}) => props.ipfs === value ? props.index : null).filter(i => i !== null).shift();
        this.state.nav1.slickGoTo(index);
    }
    getOption = (name, recipient, key) =>  {
        return { text: name, value: key, recipient, name }
    }
    search = (options, query) => new Fuse(options, this.searchOptions).search(query);
    getList = () => {
        const options = this.badges.map(({ badge, key }, i) => this.getOption(badge.coreInfo.name, badge.coreInfo.recipient, badge.storageHash.hash))
        return (
            <Grid.Row>
                <Grid.Row style={{paddingBottom: 10,}}>
                    <Dropdown
                        style={{backgroundColor: styles.buttonLight.backgroundColor}}
                        scrolling
                        autoComplete='on'
                        fluid
                        options={options}
                        onChange={this.setActive}
                        search={this.search}
                        selection
                        placeholder='Search by badge name or issuer public key'
                    />
                </Grid.Row>
            </Grid.Row>
        );
    }

    getSlider = () => {
        return (
            <Slider
                ref={slider => (this.slider1 = slider)}
                {...this.state.settings}
            >
                {this.badges.map(({badge, key}, i) => {
                    console.log(badge, key)
                    return (
                        <CustomSlide {...this.props} key={i} index={i} ipfs={key} badge={badge}/>
                    );
                })}
            </Slider>
        );
    }

    render() {   
        if(this.badges.length > 0) {
            return (
                <Grid.Row>
                    <Grid.Column width={4} >
                        {this.getList()}
                    </Grid.Column> 
                    <Grid.Column style={{height: '100vh'}}>
                        {this.getSlider()}
                        {this.props.mobile ? <Header.Subheader content='Swipe left or right to see other badges' />: null}
                    </Grid.Column>
                </Grid.Row> 
            )
        } else {
            return null;
        }
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
                this.setState({loading: {toggle: true, message: 'Checking for badges on blockchain . . .'}})
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
            <CompactInfoList badges={this.state.badges} setActive={(active, key) => this.setState({active, key})} />
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
                <Grid.Row style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 10}}>
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