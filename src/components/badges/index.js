import React, { Component } from 'react';
import { Header, Dropdown, Grid, Button, Loader, Image, Dimmer } from 'semantic-ui-react'
import { Credential, sleep } from '../verifier';
import {observer, inject } from 'mobx-react';
import { reaction } from 'mobx';
import { ThemeContext } from '../home/home';
import { styles } from '../common-styles';
import Slider from "react-slick";

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const noimage = require('../../images/no-image.png');
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
        const { context, index, mobile, ipfs, badge, refresh, ...props } = this.props;
        return (
            <Grid.Column {...props} style={{padding: mobile ? 0 : 25, width: '100%'}}>
                <Credential 
                    context={context}
                    full={true} 
                    data={badge.coreInfo}
                    degree={badge}
                    signature={badge.signature} 
                    ipfs={ipfs}
                    qrcodeAction
                    verifyAction
                    downloadAction
                    />
                {/* <QRCode id='qrcode' size={160} style={{height: 'auto', width: 'auto'}} value={qrCodeVal} /> */}
            </Grid.Column>
        );
    }
  }
@observer
export class CompactInfoList extends Component {
    searchOptions = {keys: ['name', 'recipient']}
    state = {
        settings: this.firstSliderSettings, 
        nav1: null
    }
    componentDidMount() {
        this.setState({nav1: this.slider1})
    }
    setActive = (e, {value}) => {
        const index = this.state.nav1.props.children.map(({props}) => props.ipfs === value ? props.index : null).filter(i => i !== null).shift();
        this.state.nav1.slickGoTo(index);
    }
    getOption = (name, recipient, key) =>  {
        return { text: name, value: key, recipient, name }
    }
    search = (options, query) => new Fuse(options, this.searchOptions).search(query);

    dimmerContent = () => {

        if(this.props.loading) {
            return  <Loader style={{marginTop: '1em'}} active={this.props.loading} content={<Header content='Checking blockchain for badges' style={styles.navMenuHeader} />} />
        }

        if(this.props.badges.length === 0) {
            return(
                <Grid.Row style={{display: 'flex', alignItems: 'center'}}>
                    <Button circular style={styles.buttonLight} onClick={this.props.refresh} size='large' icon='refresh'/>
                    <Header as='h4'style={styles.contentsubheader} content='It looks like we were not able to find your badges, no worries refresh to try again' />
                </Grid.Row>
            );
        }

        return null;
    }

    getList = () => {
        console.log(this.props.badges);
        return (
            <Dimmer.Dimmable style={{marginTop: this.props.mobile ? '-1rem' : 'initial', 
                paddingBottom: this.props.mobile ? 0 : 10, 
                justifyContent: 'space-around'}} 
                as={Grid.Column} dimmed={this.props.badges.length === 0 || this.props.loading}>
                <Dimmer inverted active={this.props.badges.length === 0 || this.props.loading}>
                    {this.dimmerContent()}
                </Dimmer>
                <Grid.Row>
                    <Grid.Column style={{display: 'flex'}}>
                        <Button circular style={styles.buttonLight} onClick={this.props.refresh} size='large' icon='refresh'/>
                        <Dropdown
                            style={{backgroundColor: styles.buttonLight.backgroundColor}}
                            scrolling
                            autoComplete='on'
                            fluid
                            options={this.props.badges.length > 0 ? this.props.badges.map(({ badge, key }, i) => this.getOption(badge.coreInfo.name, badge.coreInfo.recipient, badge.storageHash.hash)) : []}
                            onChange={this.setActive}
                            search={this.search}
                            selection
                            placeholder={this.props.mobile ? 'Badge Name' : 'Search by badge name or issuer public key'}
                        />
                    </Grid.Column>
                </Grid.Row>
                <Grid.Column>
                    {this.getSlider()}
                    {this.props.badges.length === 0 || this.props.loading ? <Header as='h4' style={{...styles.badge.fullCard.contentHeader, marginTop: '8.5em'}} content='Swipe left or right to see other badges' /> : null}
                </Grid.Column>
            </Dimmer.Dimmable>
        );
    }

    swipeMsg = () => <a><h4 style={{...styles.badge.fullCard.contentHeader}} >Swipe left or right to see other badges</h4></a>
    badgeImgUnder = (i) => {
        console.log(i);
        // const { imageSrc } = this.props.badges[i].coreInfo.image || noimage;
        return <a><Image  alt='badge' src={noimage} /></a>
    }

    getSlider = () => {
        
        const settings = {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: this.props.mobile,
            customPaging: 'badge-slider',
            nextArrow : <NextArrow />,
            prevArrow: <PrevArrow />,
            arrows: this.props.mobile ? false: true,
            customPaging: (i) => {
                return this.props.mobile ? this.swipeMsg() : this.badgeImgUnder(i);
            }
        };
        
        return (
            <Slider
                ref={slider => (this.slider1 = slider)}
                {...settings}
            >
                {this.props.badges.map(({badge, key}, i) => {
                    return (
                        <CustomSlide  fullMobile={this.props.mobile} {...this.props} key={i} index={i} ipfs={key} badge={badge}/>
                    );
                })}
            </Slider>
        );
    }

    render() {   
        return (
            <Grid.Row>
                {this.getList()}
            </Grid.Row>   
        );
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
            badges: [],
            errorLoadingBadges: {toggle: null, message: null}
        }

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
            badges: newCache.map(({badge, key}) => ({badge, key})),
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
                this.setState({loading: {toggle: true, message: 'Loading badges from blockchain . . .'}})
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
            // Toaster.notify("Could not load badges, click refresh button to try again", toast.TYPE.ERROR);
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

    render() {
        return (
            <Grid.Column>
                <CompactInfoList 
                    loading={this.state.loading.toggle} 
                    refresh={this.refresh} 
                    mobile={this.props.mobile} 
                    badges={this.state.badges} />
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