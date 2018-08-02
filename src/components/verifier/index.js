import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Icon, List, Header, Card, Image, Form, Message, Grid, Transition, Button, Popup, Segment, Item, Modal, Loader, Dimmer } from 'semantic-ui-react'
import  bjs from '../../badgeforcejs-lib'; 
import { toast, ToastContainer } from "react-toastify";
import { Toaster } from '../utils/toaster';
import { ThemeContext } from '../home/home';
import { styles } from '../common-styles';
import TextTruncate from 'react-text-truncate';
import QrReader from 'react-qr-reader'
import { ErrorBoundary } from '../errors/boundary';
import PropTypes from 'prop-types';
import { ProtoDecoder } from '../../badgeforcejs-lib/badgeforce_base' 
import 'animate.css/animate.min.css';

const ipfs = require('../../badgeforcejs-lib/config').Config.testnet.ipfs;
const noimage = require('../../images/no-image.png');
const moment = require('moment');

const DATE_FORMAT = 'dddd, MMMM Do YYYY, h:mm:ss a';

export const animateElem = async (element, animation, times) => {
    const node = ReactDOM.findDOMNode(element);
    const classes = ['animated', 'infinite', animation];
    classes.filter(c => node.classList.contains(c))
        .forEach(c => node.classList.add(c));
    classes.forEach(c => node.classList.toggle(c));
    await sleep(3)
    classes.forEach(c => node.classList.remove(c));
}

export const sleep = async (duration) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, duration*1000)
    });
}
export class Issuance extends Component {
    truncate = (data, id) => {
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

    getPopUp(data, header, id) {
        return (
            <Popup trigger={<a id={`__badge__${id}`} />} hideOnScroll on='click' position='top center'>
                <Popup.Content>
                    <Message size='large'>
                        <Message.Header>{header}</Message.Header>
                        <p style={{wordWrap:'break-word', maxWidth: 800}}>{data}</p>
                    </Message>
                </Popup.Content>
            </Popup>
        );
    }
    render() {
        return (
            <Card raised style={{
                    boxShadow: `rgba(62, 99, 215, 0.73) 0px 0px 8px`, 
                    WebkitBoxShadow: `rgba(62, 99, 215, 0.73) 0px 0px 8px`,
                    border: '1px solid rgb(221, 221, 221)', 
                    width: '100%'}}>
                <Card.Header as='h2' style={{
                    display: 'flex', 
                    alignItems: 'center',
                    marginBottom: 0,
                    justifyContent: 'space-between',
                    padding: 10}}>
                     <span style={styles.badge.fullCard.contentHeader}>
                        Issuance
                        <Card.Meta style={{fontSize: 'medium', display: 'flex', alignItems: 'center'}}>
                            Revokation Status: {this.props.data.revokationStatus ? <span style={{color: 'red', marginLeft: 5}}>REVOKED</span>: <span style={{color: 'green', marginLeft: 5}}>Not Revoked</span>}
                        </Card.Meta>
                    </span>
                </Card.Header>
                <Card.Content>
                    <Card.Description style={styles.badge.issuance.content}>
                        <List>
                            <List.Item style={{display: 'flex', alignItems: 'baseline'}}>
                                <span style={{marginRight: 6}}>
                                    <Header style={styles.badge.fullCard.contentHeader} as='h3' content='Issuer:'/>
                                </span> {this.truncate(this.props.data.issuerPublicKey, 'issuance_issuerPublicKey')}
                                {this.getPopUp(this.props.data.issuerPublicKey, 'Public Key of the user who issued this badge', `issuer-${this.props.data.issuerPublicKey}`)}        
                            </List.Item>

                            <List.Item style={{display: 'flex', alignItems: 'baseline'}}>
                                <span style={{marginRight: 6}}>
                                    <Header style={styles.badge.fullCard.contentHeader} as='h3' content='Recipient:'/>
                                </span> {this.truncate(this.props.data.recipientPublicKey, this.props.data.recipientPublicKey)}
                                {this.getPopUp(this.props.data.recipientPublicKey, 'Public Key of the user who received this badge', this.props.data.recipientPublicKey)}        
                            </List.Item>

                            <List.Item style={{display: 'flex', alignItems: 'baseline'}}>
                                <span style={{marginRight: 6}}>
                                    <Header style={styles.badge.fullCard.contentHeader} as='h3' content='Signature:'/>
                                </span> {this.truncate(this.props.data.signature, 'issuance_signature')}
                                {this.getPopUp(this.props.signature, 'Signature is data that proves a badge was issued by a certain issuer', 'issuance_signature')}      
                            </List.Item>

                            <List.Item style={{display: 'flex', alignItems: 'baseline'}}>
                                <span style={{marginRight: 6}}>
                                    <Header style={styles.badge.fullCard.contentHeader} as='h3' content='Proof Of Integrity Hash:'/>
                                </span> {this.truncate(this.props.data.proofOfIntegrityHash, 'issuance_proofOfIntegrityHash')}
                                {this.getPopUp(this.props.proofOfIntegrityHash, 'Proof of integrity hash is the checksum for the badges data, allowing us to check of it was tampered with', 'issuance_proofOfIntegrityHash')}      
                            </List.Item>
                        </List>
                    </Card.Description>
                </Card.Content>
            </Card>
        )
    }
}

const VerificationResultsModal = (success, header, results, trigger, icon) => (
    <Modal trigger={trigger} closeIcon>
        {console.log(results)}
        <Modal.Header as='h2'>
            <Icon size='large' {...icon}/>
            {header}
        </Modal.Header>
        <Modal.Content>
            <Modal.Description>
            <Header>Results</Header>
                <List>
                    {Object.keys(results).map((key, i) => {
                        const {success, message} = results[key];
                        return (
                            <List.Item key={i} >
                                <List.Header content={key} as='h4'/>
                                <span style={{color: success ? 'green' : 'red'}}>{message} </span>
                            </List.Item>
                        )
                    })}
                </List>
            </Modal.Description>
        </Modal.Content>
    </Modal>
  )

export class CredentialCardActions extends Component {
    download = (mobile) => {
        return <Button 
                disabled={this.props.loading}
                style={styles.buttonLightNoBorder} 
                onClick={this.props.download.callback}
                content={!mobile ? 'download credential file' : null}
                icon='download' 
                labelPosition='left'/> 
    }

    qrCode = (mobile) => {
        return <Button 
                disabled={this.props.loading} 
                style={styles.buttonLightNoBorder}
                content={!mobile ? 'show qrcode' : null} />
    }

    verify = (mobile) => {
        return <Button 
                disabled={this.props.loading} 
                onClick={this.props.verify.callback} 
                style={styles.buttonDarkNoBorder}
                icon='check'
                content={!mobile ? 'verify' : null} />
    }

    getActions(mobile) {
        console.log(mobile)
        return (
            <Button.Group size='medium' attached='top' icon={mobile}>
                {this.props.qrcode.enabled ? this.qrCode(mobile) : null}
                {this.props.download.enabled ? this.download(mobile) : null}
                {this.props.verify.enabled ? this.verify(mobile) : null}
            </Button.Group>
        );
    }

    render() {
        return this.getActions(this.props.mobile)
    }
}

const actionOptions = {enabled: PropTypes.bool.isRequired, callback: PropTypes.func.isRequired};

CredentialCardActions.propTypes = {
    mobile: PropTypes.bool,
    loading: PropTypes.bool,
    verify: PropTypes.shape(actionOptions),
    qrcode: PropTypes.shape(actionOptions),
    download: PropTypes.shape(actionOptions),
}
export class CredentialComponent extends Component {
    verifying = 'rgba(62, 99, 215, 0.73)';
    errorVerifying = 'rgba(255, 0, 18, 0.82)';
    successVerifying = 'rgb(25, 152, 61)';
    verifyIcons = {
        success: {
            as: () => {
                return VerificationResultsModal(false, 
                    'Verification Successful: Badge data is valid. Below are the results', 
                    this.state.results.all, 
                    <Button icon='check circle outline' inverted circular color='green' content='verification results' />, {name:'check circle outline', color:'green'})
            }
        },
        error: {
            as: () => {
                return VerificationResultsModal(false, 
                    'Verification Failure: Badge data is invalid. Below are the results', 
                    this.state.results.all, 
                    <Button icon='ban' color='red' inverted circular content='verification results' />, {name:'ban', color:'red'})
            }
        },
        warning: {color: 'red', name: 'warning'},
        loading: {loading: true, color: 'blue', name: 'spinner'}
    }

    initialState = {
        inProgress: false,
        results: {all: [], errors: [], data: []}, //this.props.verifyResults, //
        icon: this.verifyIcons.warning,
    }

    componentDidMount() {
        const { verified, verificationData } = this.props;
        if(verified && verificationData) {
            this.handleVerifyResults(verificationData);
        }
    }

    constructor(props) {
        super(props);
        this.state = this.initialState;
        this.ipfsURI = `${ipfs}/${this.props.ipfs}`
        this.truncate = this.truncate.bind(this);
        this.getPopUp = this.getPopUp.bind(this);
        this.verify = this.verify.bind(this);
        this.badgeforceVerifier = new bjs.BadgeforceVerifier((data) => {});
    }

    truncate(data, id) {
        return (
            <TextTruncate
                line={1}
                truncateText="…"
                text={data}
                textTruncateChild={<a href='' onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`__badge__${id}`).click()
                }} >more</a>}
            />
        );
    }

    getPopUp(data, header, id) {
        return (
            <Popup trigger={<a id={`__badge__${id}`} />} hideOnScroll on='click' position='top center'>
                <Popup.Content>
                    <Message size='large'>
                        <Message.Header>{header}</Message.Header>
                        <p style={{wordWrap:'break-word', maxWidth: 800}}>{data}</p>
                    </Message>
                </Popup.Content>
            </Popup>
        );
    }
    
    async verify() {
        this.setState({inProgress: true, icon: this.verifyIcons.loading});
        await sleep(2);
        try {
            const { recipient, name, institutionId } = this.props.data;
            const data = await this.badgeforceVerifier.verifyAcademic(recipient, name, institutionId);
            this.handleVerifyResults(data);
        } catch (error) {
            console.log(error);
            this.setState({inProgress: false, verified: true, icon: this.verifyIcons.warning});
            Toaster.notify('Could not verify at this time, try again later', toast.TYPE.ERROR);
        }
    }

    handleVerifyResults = async (data) => {
        const errors = Object.values(data.results).filter(result  => !result.success);
        const update = {inProgress: false, verified: true, results: this.initialState.results}
        update.results.all = data.results;
        if(errors.length > 0) {
            update.results.errors = errors.map(error => error.message);
            update.icon = this.verifyIcons.error
            this.setState(update);
        } else {
            update.results.data = Object.values(data.results).map(({ message }) => message)
            update.icon = this.verifyIcons.success
            this.setState(update);
        }
    }

    downloadQRC = () => {
        const dataStr = "data:text/json;charset=utf-8," + JSON.stringify({data: ProtoDecoder.encodedQRDegree(this.props.data)});
        const link = document.createElement("a");
        link.href = dataStr;
        link.download = `${this.props.data.name}.bfac`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    verifyBtn = () => {
        return (
            <Button style={styles.buttonDark} onClick={this.verify}>
                <Button.Content className='animated infinite pulse' content='verify me!' />
            </Button>
        );
    }

    showFullContent = (mobile) => {
        const imageSrc = this.props.data.image || noimage;
        return (
            <Card raised style={{
                boxShadow: `rgba(62, 99, 215, 0.73) 0px 0px 8px`, 
                WebkitBoxShadow: `rgba(62, 99, 215, 0.73) 0px 0px 8px`,
                border: '1px solid rgb(221, 221, 221)', 
                width: '100%'}}>
                <Card.Header as='h2' style={{
                    display: 'flex', 
                    flexDirection: this.props.mobile ? 'column' : 'row',
                    alignItems: !this.props.mobile ? 'center': null,
                    marginBottom: 0,
                    justifyContent: 'space-between'}}>
                    <Image style={{marginLeft: 5, alignSelf: this.props.mobile ? 'center' : null}} floated='left' size='tiny' src={imageSrc} />
                    <span style={styles.badge.fullCard.contentHeader}>
                        {this.props.data.name}
                        <Card.Meta as='p' style={{fontSize: 'medium'}}>
                            Date Earned: {moment.unix(this.props.data.dateEarned).format(DATE_FORMAT)}<br/>
                            Expires: {moment.unix(this.props.data.expiration).format(DATE_FORMAT)}
                        </Card.Meta>
                    </span>
                    {!this.state.verified && !this.state.inProgress ? this.verifyBtn() : <Icon size='large' {...this.state.icon}/>}
                </Card.Header>
                <Card.Content>
                    <Card.Description style={{fontSize: 'large'}}>
                        <List>
                            <List.Item style={{display: 'flex', alignItems: 'baseline', fontSize: this.props.mobile ? 'medium' : null}}>
                                <Icon style={{display: 'flex', alignSelf: 'center', marginRight: 10, color: styles.badge.fullCard.content.color}} size='small' name='university' />
                                <span style={{marginRight: 6}}>
                                    <Header style={styles.badge.fullCard.contentHeader} as='h3' content='School:'/>
                                </span> {this.props.data.school}
                            </List.Item>

                            <List.Item style={{display: 'flex', alignItems: 'baseline', fontSize: this.props.mobile ? 'medium' : null}}>
                                <Icon style={{display: 'flex', alignSelf: 'center', marginRight: 10, color: styles.badge.fullCard.content.color}} size='small' name='certificate' />
                                <span style={{marginRight: 6}}>
                                    <Header style={styles.badge.fullCard.contentHeader} as='h3' content='Institution ID:'/>
                                </span>{this.props.data.institutionId}
                            </List.Item>

                            <List.Item style={{display: 'flex', alignItems: 'baseline', fontSize: this.props.mobile ? 'medium' : null}}>
                                <Icon style={{display: 'flex', alignSelf: 'center', marginRight: 10, color: styles.badge.fullCard.content.color}} size='small' name='user' />
                                <span style={{marginRight: 6}}>
                                    <Header style={styles.badge.fullCard.contentHeader} as='h3' content='Issuer:'/>
                                </span> {this.truncate(this.props.data.issuer, `issuer-${this.props.data.issuer}`)}
                                {this.getPopUp(this.props.data.issuer, 'Public Key of the user who issued this badge', `issuer-${this.props.data.issuer}`)}        
                            </List.Item>

                            <List.Item style={{display: 'flex', alignItems: 'baseline', fontSize: this.props.mobile ? 'medium' : null}}>
                                <Icon style={{display: 'flex', alignSelf: 'center', marginRight: 10, color: styles.badge.fullCard.content.color}} size='small' name='graduation cap' />
                                <span style={{marginRight: 6}}>
                                    <Header style={styles.badge.fullCard.contentHeader} as='h3' content='Recipient:'/>
                                </span> {this.truncate(this.props.data.recipient, this.props.data.recipient)}
                                {this.getPopUp(this.props.data.recipient, 'Public Key of the user who received this badge', this.props.data.recipient)}        
                            </List.Item>

                            <List.Item style={{display: 'flex', alignItems: 'baseline', fontSize: this.props.mobile ? 'medium' : null}}>
                                <Icon style={{display: 'flex', alignSelf: 'center', marginRight: 10, color: styles.badge.fullCard.content.color}} size='small' name='pencil alternate' />
                                <span style={{marginRight: 6}}>
                                    <Header style={styles.badge.fullCard.contentHeader} as='h3' content='Signature:'/>
                                </span> {this.truncate(this.props.signature, this.props.signature)}
                                {this.getPopUp(this.props.signature, 'Signature is data that proves a badge was issued by a certain issuer', this.props.signature)}      
                            </List.Item>
                            <List.Item style={{display: 'flex', alignItems: 'baseline', fontSize: this.props.mobile ? 'medium' : null}}>
                                <Icon style={{display: 'flex', alignSelf: 'center', marginRight: 10, color: styles.badge.fullCard.content.color}} size='small' name='cubes' />
                                <span style={{marginRight: 6}}>
                                    <Header style={styles.badge.fullCard.contentHeader} as='a' target='blank' href={this.ipfsURI} content='IPFS Hash:'/>
                                </span>
                                {this.truncate(this.props.ipfs, this.props.ipfs)}
                                {this.getPopUp(this.props.ipfs, 'Link to the core data of this badge in decentralized storage', this.props.ipfs)}  
                            </List.Item>
                        </List>
                    </Card.Description>
                </Card.Content>
                <Card.Content extra>
                    <CredentialCardActions 
                        mobile={this.props.mobile}
                        loading={this.state.inProgress}
                        verify={{enabled: this.props.verifyAction, callback: this.verify}}
                        qrcode={{enabled: this.props.qrcodeAction, callback: console.log}}
                        download={{enabled: !this.props.mobile && this.props.downloadAction, callback: this.downloadQRC}}
                    />
                </Card.Content>
            </Card> 
        );
    }
    
    showPreview = () => {
        const imageSrc = this.props.data.image || noimage;
        return (
            <Card raised style={{
                    boxShadow: `rgba(62, 99, 215, 0.73) 0px 0px 8px`, 
                    WebkitBoxShadow: `rgba(62, 99, 215, 0.73) 0px 0px 8px`,
                    border: '1px solid rgb(221, 221, 221)', 
                    width: '100%'}}>
                    <Card.Header as='h2' style={{
                            display: 'flex', 
                            alignItems: 'center',
                            marginBottom: 0,
                            justifyContent: 'space-between'}}>
                        <Image style={{marginLeft: 5}} floated='left' size='tiny' src={imageSrc} />
                        <span style={styles.badge.fullCard.contentHeader}>
                                Preview - {this.props.data.name ? this.props.data.name : null}
                            <Card.Meta as='p' style={{fontSize: 'medium'}}>
                                Date Earned: {moment.unix(this.props.data.dateEarned).format(DATE_FORMAT)}<br/>
                                Expires: {moment.unix(this.props.data.expiration).format(DATE_FORMAT)}
                            </Card.Meta>
                        </span>
                    </Card.Header>
                    <Card.Content>
                        <Card.Description>
                            <List>
                                <List.Item style={{display: 'flex', alignItems: 'baseline'}}>
                                    <Icon style={{display: 'flex', alignSelf: 'center', marginRight: 10, color: styles.badge.fullCard.content.color}} size='small' name='university' />
                                    <span style={{marginRight: 6}}>
                                        <Header style={styles.badge.fullCard.contentHeader} as='h3' content='School:'/>
                                    </span> {this.props.data.school}
                                </List.Item>

                                <List.Item style={{display: 'flex', alignItems: 'baseline'}}>
                                    <Icon style={{display: 'flex', alignSelf: 'center', marginRight: 10, color: styles.badge.fullCard.content.color}} size='small' name='certificate' />
                                    <span style={{marginRight: 6}}>
                                        <Header style={styles.badge.fullCard.contentHeader} as='h3' content='Institution ID:'/>
                                    </span>{this.props.data.institutionId}
                                </List.Item>
                                {/* <List.Item style={{display: 'flex', alignItems: 'baseline'}}>
                                    <Icon style={{display: 'flex', alignSelf: 'center', marginRight: 10, color: styles.badge.fullCard.content.color}} size='small' name='user' />
                                    <span style={{marginRight: 6}}>
                                        <Header style={styles.badge.fullCard.contentHeader} as='h3' content='Issuer:'/>
                                    </span> {this.truncate(this.props.data.issuer, `issuer-${this.props.data.issuer}`)}
                                    {this.getPopUp(this.props.data.issuer, 'Public Key of the user who issued this badge', `issuer-${this.props.data.issuer}`)}        
                                </List.Item>

                                <List.Item style={{display: 'flex', alignItems: 'baseline'}}>
                                    <Icon style={{display: 'flex', alignSelf: 'center', marginRight: 10, color: styles.badge.fullCard.content.color}} size='small' name='graduation cap' />
                                    <span style={{marginRight: 6}}>
                                        <Header style={styles.badge.fullCard.contentHeader} as='h3' content='Recipient:'/>
                                    </span> {this.truncate(this.props.data.recipient, this.props.data.recipient)}
                                    {this.getPopUp(this.props.data.recipient, 'Public Key of the user who received this badge', this.props.data.recipient)}        
                                </List.Item> */}
                            </List>
                        </Card.Description>
                    </Card.Content>
            </Card>
        );
    }

    render() {
        return this.props.full ? this.showFullContent() : this.showPreview();
    }
}
export class Credential extends Component {
    render() {
        return (
            <ThemeContext.Consumer>
                {theme => <CredentialComponent {...this.props} mobile={theme} /> }
            </ThemeContext.Consumer>
        )
    }
}

export class VerifyResults extends Component {
    render() {
        return (
            <List divided relaxed>
                {Object.keys(this.props.results).map((key, i) => {
                    return (
                        <List.Item key={i}>
                            <Icon size='large' verticalalign='middle' name={this.props.results[key].success ? 'check': 'warning circle'} color={this.props.results[key].success ? 'green': 'red'}/> 
                            <List.Content>
                                <List.Header as='h4'>{key}</List.Header>
                                <List.Description>{this.props.results[key].message}</List.Description>
                            </List.Content>
                        </List.Item>
                    )
                })}
            </List>
        )
    }
}

export class Verifier extends Component {
    constructor(props) {
        super(props);

        const heading = 'Verifier';
        const descscription = `The BadgeForce Verifier allows you to verify the authenticity of any credential issued using the BadgeForce platform. Verification is done in seconds.`;
        const requrements = [
            {heading:'Recipient publickey', icon:'user', info: 'This is is the public address of the user who owns the credential'},
            {heading:'Credential Name', icon:'shield', info: 'The name of the credential you want to verify, be sure the spelling is exactly the same'},
            {heading:'Institution ID', icon:'university', info: 'This is the ID assigned to the Issuer'},
        ]

        this.styles = {
            requirementHeading: {
                fontWeight: 'bold',
            },
        }

        this.state = {
            recipient: '', 
            name: '', 
            institutionId: '',
            error: null,
            results: null,
            toastId: null,
            loading: false,
            loaderMessage: null,
            visible: false,
            formError: null,
            formErrors: [],
            qrcode: false,
            heading, descscription, requrements,
            showResults: false,
            showForm: true
        }

        this.handleScan = this.handleScan.bind(this)
        this.handleVerify = this.handleVerify.bind(this);
        this.isValidForm = this.isValidForm.bind(this);
        this.uploadJSON = this.uploadJSON.bind(this);
        this.handleStatusUpdate = this.handleStatusUpdate.bind(this);
        this.showResults = this.showResults.bind(this);
        this.showQRScanner = this.showQRScanner.bind(this);
        this.verifyButtonRef = React.createRef();
        this.qrScannerRef = React.createRef();

        this.badgeforceVerifier = new bjs.BadgeforceVerifier(this.handleStatusUpdate);        
    }

    async handleStatusUpdate(data) {
        try {
            await sleep(2);
            const { message, success } = data;
            const icon = success ? {name: 'check', color: 'green'} : {name: 'ban', color: 'red'}
            this.setState({loaderMessage: {message: message, icon: icon}});
        } catch (error) {
            console.log(error);
        }    
    }

    async uploadJSON(e) {
        this.setState({loading: true, results: null, visible: false});
        try {
            const files = document.getElementById('jsonUpload').files;
            const file = files.item(0);
            const done = async (error, results) => {
                document.getElementById('jsonUpload').value = '';
                await sleep(2);
                
                if(error) {
                    Toaster.notify(error.message, toast.TYPE.ERROR);
                    this.setState({loading: false, results: null, visible: false});
                    return
                }

                const {recipient, name, institutionId} = results;
                this.setState({
                    recipient, 
                    name,
                    institutionId,
                    loading: false,
                }, async () => await this.handleVerify());
                // Toaster.notify('Ready to verify', toast.TYPE.SUCCESS);
                // await animateElem(this.verifyButtonRef.current, 3, 'shake');
            }
            this.badgeforceVerifier.readFile(file, this.badgeforceVerifier.fileTypes.bfac, done);
        } catch (error) {
            console.log(error);
            await sleep(3);
            this.setState({
                recipient: '', 
                name: '', 
                institutionId: '',
                results: null,
                loading: false,
                error
            });
        }
    }

    isValidForm() {
        const errors = [
            !this.badgeforceVerifier.isValidPublicKey(this.state.recipient) ? new Error('Invalid public key for recipient') : null,
            this.state.name === '' ? new Error('Credential name is required') : null,
        ].filter(error => {
            return error !== null;
        });

        if(errors.length > 0) {
            this.setState({formErrors: errors, formError: true});
            return false
        }

        this.setState({formErrors: errors, formError: false});
        return true;
    }
    showFormErrors() {
        return (
            <Message error
                header='Problems with your input'
                content={<Message.List items={this.state.formErrors.map((error, i) => {
                    return <Message.Item key={i} content={error.message} />
                })} />}
            />
        )
    }
    async handleVerify() {
        if(this.isValidForm()){
            this.setState({results: null, visible: false, loading: true});
            try {
                const results = await this.badgeforceVerifier.verifyAcademic(this.state.recipient, this.state.name, 'bf-edu-123');
                Toaster.update(this.state.toastId, 'Done Verifying', toast.TYPE.INFO);
                this.setState({
                    results, 
                    recipient: '', 
                    name: '', 
                    institutionId: '',
                    toastId: null,
                    formError: false,
                    formErrors: [],
                    loading: false,
                    visible: true,
                    showForm: false
                });
            } catch (error) {
                console.log(error);
                Toaster.update(this.state.toastId, error.message, toast.TYPE.ERROR);
                this.setState({
                    results: null,
                    toastId: null,
                    loading: false,
                    formError: false,
                    formErrors: [],
                });
            }
        }        
    }
    showQRScanner() {
        this.setState({qrcode: true}, () => {
            this.qrScannerRef.current.openImageDialog();
        })
    }
    handleScan(data) {
        Toaster.notify(data.toString())
    }
    showResultsData() {
        return (
            <Grid.Column >
                <Header
                    as='h1'
                    content='Results'
                    textAlign='center'
                />
                <Transition as={Grid} animation='scale' duration={900} visible={this.state.visible}>
                    <VerifyResults results={this.state.results.results} />
                </Transition>
            </Grid.Column>
        );
    }
    showResults() {
        return (
            <Credential
                full={true}
                data={this.state.results.degree.coreInfo}
                verified={true}
                verificationData={this.state.results} 
                signature={this.state.results.degree.signature} 
                ipfs={this.state.results.degree.storageHash.hash}/>
        );
    }

    renderRequirements() {
        return (
            <List celled>
                {this.state.requrements.map((requirement, i) => {
                    return (
                        <List.Item key={i} style={{display: 'flex', alignItems: 'baseline'}}>
                            <Icon style={{display: 'flex', alignSelf: 'center', marginRight: 10, color: styles.badge.fullCard.content.color}} name={requirement.icon} />
                            <span style={{marginRight: 6}}>
                                <Header style={styles.badge.fullCard.contentHeader} as='h4' content={`${requirement.heading}`}/>
                            </span>
                            <span className='content-text'>{requirement.info}</span>
                        </List.Item>
                    );
                })}
            </List>
        );
    }

    renderForm() {
        return (
            <Form size='large' error={this.state.formError ? true : undefined}>
                <ToastContainer autoClose={5000} />
                <Form.Field style={styles.inputField} error={this.state.formError ? true : undefined} value={this.state.recipient}>
                    <input style={styles.inputField} placeholder='Recipient Public Key' onChange={(e) => this.setState({recipient: e.target.value})}/>
                </Form.Field>
                <Form.Field style={styles.inputField} error={this.state.formError ? true : undefined} value={this.state.name}>
                    <input style={styles.inputField} placeholder='Credential Name' onChange={(e) => this.setState({name: e.target.value})}/>
                </Form.Field>
                <Form.Field style={styles.inputField} error={this.state.formError ? true : undefined} value={this.state.institutionId}>
                    <input disabled style={styles.inputField} placeholder='bf-edu-123' onChange={(e) => this.setState({institutionId: e.target.value})} />
                </Form.Field>
                <Button.Group vertical={this.props.mobile || this.props.tablet ? true : false } fluid>
                    <Button size='small' ref={this.verifyButtonRef} disabled={this.state.loading} style={styles.buttonLight} onClick={this.handleVerify} content='Verify Using Form' icon='check' labelPosition='left'/>
                    <Button.Or />
                    <Button size='small' disabled={this.state.loading} style={styles.buttonDark} content='Verify Using BFAC File Upload' icon='upload' labelPosition='right' onClick={() => document.getElementById('jsonUpload').click()} />
                </Button.Group>
                    {/* <Form.Button disabled={this.state.loading} style={{display: 'flex', alignSelf: 'flex-start'}} color='orange' size='large' content='Verify From QR Code Scan' icon='qrcode' labelPosition='right' onClick={this.showQRScanner} /> */}
                {this.state.formErrors.length > 0 ? this.showFormErrors() : null}
                <input type="file" id="jsonUpload" onChange={this.uploadJSON} style={{display: 'none'}} />  
            </Form>
        );
    }

    formOrResults = () => {
        return <Button 
                    size='large' 
                    style={styles.buttonDark} 
                    content={this.state.showForm ? 'view results' : 'verify another'} 
                    icon={this.state.showForm ? 'shield' : 'check'} 
                    labelPosition='right' 
                    onClick={() => this.setState({showForm: !this.state.showForm})} />
    } 

    getButtonHeader = () => {
        if(this.state.results) {
            return this.formOrResults()
        } 

        return null;
    }

    render() {
        return (
            <Segment style={{
                padding: '4em 0em'
            }} vertical>
                <Dimmer active={this.state.loading} inverted>
                    {this.state.loading ? 
                        <Loader inverted>
                            {this.state.loaderMessage ? <span> {this.state.loaderMessage.message} <Icon {...this.state.loaderMessage.icon} /> </span> : null}
                        </Loader> : null }
                </Dimmer>
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
                        </Grid.Column>
                        <Grid.Column floated='right' width={8}>
                            {this.getButtonHeader()}
                            {this.state.results && !this.state.showForm ? this.showResults() : null}
                            {this.state.showForm ? this.renderForm() : null}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        )
    }
}

export const VerifierComponent = (props) => {
    return (
        <ThemeContext.Consumer>
            {theme => {
                return (
                    <ErrorBoundary>
                        <Verifier mobile={theme} />
                    </ErrorBoundary>
                );
            }}
        </ThemeContext.Consumer>
    )
}
/* {this.state.qrcode ? <div>
                    <Form.Button disabled={this.state.loading} style={{display: 'flex', alignSelf: 'flex-start'}} color='orange' size='large' content='Close' icon='close' labelPosition='right' onClick={() => this.setState({qrcode: false})} />
                        <QrReader
                        ref={this.qrScannerRef}
                        delay={100}
                        onError={err => Toaster.notify('Something went wrong reading QR Code', toast.TYPE.ERROR)}
                        onScan={this.handleScan}
                        style={{ width: '100%' }}
                        legacyMode={true}
                    />
                </div>
                : null} */
                /* {this.state.results ? this.showResults() : null} */