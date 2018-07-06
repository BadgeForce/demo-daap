import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Icon, List, Header, Card, Image, Form, Message, Grid, Transition, Button } from 'semantic-ui-react'
import  bjs from '../../badgeforcejs-lib'; 
import { toast, ToastContainer } from "react-toastify";
import { Toaster } from '../utils/toaster';

import QrReader from 'react-qr-reader'

const ipfs = require('../../badgeforcejs-lib/config').Config.testnet.ipfs;
const logo = require('../../assets/LogoBadgeforce.png');
const moment = require('moment');

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
    render() {
        return (
            <Card>
                <Card.Content header='Issuance' />
                <Card.Content style={{wordWrap: 'break-word'}}>
                    Signature: {this.props.data.signature}<br/>
                    Issuer: {this.props.data.issuerPublicKey}<br/>
                    Recipient: {this.props.data.recipientPublicKey}<br/>
                    Revokation Status: {this.props.data.revokationStatus}<br/>
                    Proof Of Integrity Hash: {this.props.data.proofOfIntegrityHash}<br/>
                </Card.Content>
            </Card>
        )
    }
}
export class Credential extends Component {
    constructor(props) {
        super(props);
        this.ipfsURI = `${ipfs}/${this.props.ipfs}`
    }
    showFullContent = () => {
        console.log(this.props.data.image)
        const imageSrc = this.props.data.image || logo;
        return (
            <Card.Content>
                <Card.Content style={{wordWrap: 'break-word'}}>
                    <Image floated='left' size='small' verticalAlign='middle' src={imageSrc} />
                    <Card.Header>{this.props.data.name}</Card.Header>
                    <Card.Meta>Date Earned {moment.unix(this.props.data.dateEarned).toString()}</Card.Meta>
                    <Card.Description>
                        School: {this.props.data.school}<br/>
                        Institution ID: {this.props.data.institutionId}<br/>
                        Issuer: {this.props.data.issuer}<br/>
                        Recipient: {this.props.data.recipient}<br/>
                        <a target='blank' href={this.ipfsURI}>IPFS Hash {this.props.ipfs}</a><br/>
                        Expires {moment.unix(this.props.data.expiration).toString()}<br/>
                        Signature {this.props.signature}
                    </Card.Description>
                </Card.Content>
            </Card.Content>
        );
    }
    showPreview = () => {
        const imageSrc = this.props.data.image || logo;
        return (
            <Card.Content style={{wordWrap: 'break-word'}}>
                <Image floated='right' size='small' verticalAlign='middle' src={imageSrc} />
                <Card.Header>Preview {this.props.data.name ? `- ${this.props.data.name}`: null}</Card.Header>
                <Card.Meta>{this.props.data.dateEarned ? `Date Earned: ${moment(this.props.data.dateEarned).toString()}` : null}</Card.Meta>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <p>School: {this.props.data.school}<br/></p>
                    <p>Institution ID: {this.props.data.institutionId}<br/></p>
                    <p>Issuer: {this.props.data.issuer}</p><br/>
                    <p>{this.props.data.recipient ? `Recipient: ${this.props.data.recipient}` : null}</p><br/>
                    <p>{this.props.data.expiration ? `Expires: ${moment(this.props.data.expiration).toString()}` : null}<br/></p>
                </div>
            </Card.Content>
        );
    }
    render() {
        return (
            <Card raised style={{width: '100%'}}>
                {this.props.full ? this.showFullContent() : this.showPreview()} 
            </Card>
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
        this.state = {
            recipient: '', 
            name: '', 
            institutionId: '',
            error: null,
            results: null,
            toastId: null,
            loading: false,
            visible: false,
            formError: null,
            formErrors: [],
            qrcode: false,
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
            const {message, success} = data;
            Toaster.update(this.state.toastId, message, success ? toast.TYPE.SUCCESS : toast.TYPE.ERROR);
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
            this.state.institutionId === '' ? new Error('Institution ID is required') : null,
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
            const toastId = Toaster.notify('Verifying', toast.TYPE.INFO);
            this.setState({results: null, visible: false, toastId, loading: true});
            try {
                const results = await this.badgeforceVerifier.verifyAcademic(this.state.recipient, this.state.name, this.state.institutionId);
                Toaster.update(this.state.toastId, 'Done Verifying', toast.TYPE.INFO);
                this.setState({
                    results, 
                    recipient: '', 
                    name: '', 
                    institutionId: '',
                    toastId: null,
                    formError: false,
                    formErrora: [],
                    loading: false,
                    visible: true,
                });
            } catch (error) {
                console.log(error);
                Toaster.update(this.state.toastId, error.message, toast.TYPE.ERROR);
                this.setState({
                    recipient: '', 
                    name: '', 
                    institutionId: '',
                    results: null,
                    toastId: null,
                    loading: false,
                    formError: false,
                    formErrora: [],
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
    showResults() {
        return (
            <Grid.Row container='true' columns={2} stackable='true'>
                <Grid.Column style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <Header
                        as='h1'
                        content='Credential'
                        textAlign='center'
                        subheader='Credential data is stored off chain in IPFS, Issuance is kept on chain immutable and referenced for verification'
                    />
                    <Credential
                        full={true}
                        data={this.state.results.degree.coreInfo} 
                        signature={this.state.results.degree.signature} 
                        ipfs={this.state.results.degree.storageHash.hash}/>
                    {/* <Issuance data={this.state.results.issuance} /> */}
                </Grid.Column>
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
            </Grid.Row>
        );
    }

    render() {
        return (
            <Grid.Column>
                {/* {this.state.qrcode ? <div>
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
                : null} */}
                <Grid.Column>
                    <ToastContainer autoClose={5000} />
                    <Form loading={this.state.loading} size='large' error={this.state.formError ? true : undefined}>
                        <Form.Input error={this.state.formError ? true : undefined} value={this.state.recipient}  mobile={4} tablet={12} placeholder='Recipient Public Key' onChange={(e, recipient) => this.setState({recipient: recipient.value})} />
                        <Form.Input error={this.state.formError ? true : undefined} value={this.state.name}  mobile={4} tablet={12} placeholder='Credential Name' onChange={(e, name) => this.setState({name: name.value})} />
                        <Form.Input error={this.state.formError ? true : undefined} value={this.state.institutionId}  mobile={4} tablet={12} placeholder='Institution ID' onChange={(e, institutionId) => this.setState({institutionId: institutionId.value})} />
                        <Form.Group style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Form.Field style={{paddingBottom: 10}}>
                                <Button ref={this.verifyButtonRef} disabled={this.state.loading} style={{display: 'flex', alignSelf: 'flex-start'}} color='blue' onClick={this.handleVerify} size='large' content='verify' icon='check' labelPosition='right'/>
                            </Form.Field>
                            {/* <Form.Button disabled={this.state.loading} style={{display: 'flex', alignSelf: 'flex-start'}} color='orange' size='large' content='Verify From QR Code Scan' icon='qrcode' labelPosition='right' onClick={this.showQRScanner} /> */}
                            <Form.Button disabled={this.state.loading} style={{display: 'flex', alignSelf: 'flex-start'}} color='black' size='large' content='Verify From BFAC File Upload' icon='upload' labelPosition='right' onClick={() => document.getElementById('jsonUpload').click()} />
                        </Form.Group>
                        {this.state.formErrors.length > 0 ? this.showFormErrors() : null}
                        <input type="file" id="jsonUpload" onChange={this.uploadJSON} style={{display: 'none'}} />  
                    </Form>
                </Grid.Column>
                {this.state.results ? this.showResults() : null}
            </Grid.Column>
        );
    }
}
