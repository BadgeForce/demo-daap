import React, { Component } from 'react';
import { List, Header, Image, Grid, Button, Dimmer, Loader } from 'semantic-ui-react'
import { Credential, sleep } from '../verifier';
import { ProtoDecoder } from '../../badgeforcejs-lib/badgeforce_base' 
import {observer, inject } from 'mobx-react';
const logo = require('../../assets/LogoBadgeforce.png');
const QRCode = require('qrcode.react');

const moment = require('moment');
@observer
export class CompactInfoList extends Component{
    badges = this.props.badges;
    handleClick = (badge, key) => {
        this.props.setActive(badge, key);
    }
    getList = () => {
        return this.badges.map((data, i) => {
            const { badge, key } = data;
            return (
                <List.Item onClick={() => this.handleClick(badge, key)} key={i}>
                    <Image size='tiny' src={badge.coreInfo.image || logo} />
                    <List.Content>
                        <List.Header as='a'>{badge.coreInfo.name}</List.Header>
                        <List.Description>Date Earned: {moment.unix(badge.coreInfo.dateEarned).toString()}</List.Description>
                    </List.Content>
                </List.Item>
            );
        });
    }
    render() {   
        return(
            <List relaxed celled selection divided>
                {this.badges.length > 0 ? this.getList() : null}
            </List>
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
        }
        this.downloadQRC = this.downloadQRC.bind(this);
        this.qrc = React.createRef();
        this.accountStore = this.props.accountStore;
        this.refresh = this.refresh.bind(this);
    }
    async componentWillMount() {
        if(this.props.accountStore.current !== null && this.props.badgeStore.cache.length === 0 ) {
            this.setState({loading: {toggle: true, message: 'No badges found, polling blockchain . . .'}})
            await this.props.badgeStore.poll();
            sleep(3); 
            this.setState({loading: {
                toggle: false, message: '', 
                active: this.props.badgeStore.cache[0].badge, 
                key: this.props.badgeStore.cache[0].key
            }});
        } else {
            this.setState({
                active: this.props.badgeStore.cache[0].badge, 
                key: this.props.badgeStore.cache[0].key
            });
        }
    }
    async refresh() {
        this.setState({loading: {toggle: true, message: 'Checking blockchain for new badges . . .'}})
        await this.props.badgeStore.poll();
        sleep(2);
        this.setState({loading: {
            toggle: false, message: '', 
            active: this.props.badgeStore.cache[0].badge, 
            key: this.props.badgeStore.cache[0].key
        }});
    }
    renderBadges() {
        return (
            <Grid.Row>
                <Grid.Column width={4} >
                    <CompactInfoList badges={this.props.badgeStore.cache} setActive={(active, key) => this.setState({active, key})} />
                </Grid.Column> 
                <Grid.Column style={{height: '100vh'}} computer={12} mobile={4} tablet={12}>
                    {this.state.active ? this.renderActive() : null}
                </Grid.Column>  
            </Grid.Row>
        );
    }
    downloadQRC() {
        const dataStr = "data:text/json;charset=utf-8," + JSON.stringify({data: ProtoDecoder.encodedQRDegree(this.state.active)});
        const link = document.createElement("a");
        link.href = dataStr;
        link.download = `badgeforce-credential-${this.state.active.coreInfo.name}.bfac`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    renderActive() {
        // const qrCodeVal = JSON.stringify({data: ProtoDecoder.encodedQRStorageHash(this.state.key)});
        // console.log(qrCodeVal);
        return(
            <div>
                <Credential full={true} data={this.state.active.coreInfo} signature={this.state.active.signature} ipfs={this.state.key}/>
                {/* <QRCode id='qrcode' size={160} style={{height: 'auto', width: 'auto'}} value={qrCodeVal} /> */}
                <Button style={{display: 'flex', alignSelf: 'flex-start'}} color='blue' onClick={this.downloadQRC} size='large' content='download credential file' icon='download' labelPosition='right'/>
            </div>
        );
    }
    noBadges() {
        return(
            <Grid.Row>
                <Grid.Column computer={12} mobile={4} tablet={12}>
                    <Header style={{display: 'flex', alignItems: 'center'}} as='h1' content='No Badges Found For This Account' textAlign='center' /> 
                </Grid.Column> 
            </Grid.Row>
        );
    }
    render() {
        return (
            <Grid.Column>
                <Dimmer active={this.state.loading.toggle}>
                    <Loader indeterminate>{this.state.loading.message}</Loader>
                </Dimmer>
                <Grid.Row style={{display: 'flex', paddingBottom: 40, justifyContent: 'flex-end'}}>
                    <Button style={{display: 'flex', alignSelf: 'flex-start'}} circular color='grey' onClick={this.refresh} size='large' icon='refresh'/>
                </Grid.Row>
                <Grid columns={2} centered container stackable>
                     {this.props.badgeStore.cache.length > 0 ? this.renderBadges() : this.noBadges()}
                </Grid>
            </Grid.Column>
        )
    }
}