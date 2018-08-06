import React, { Component } from 'react';
import { Form, Message, Grid, Segment, Item, Header, Button, Popup } from 'semantic-ui-react'
import  { AccountManager } from '../../badgeforcejs-lib/account_manager';
import  { Transactor } from '../../badgeforcejs-lib/transactor';
import { InfomaticModal, PublicKeyInfo, CredentialNameInfo, InstitutionIDInfo } from '../common/info';
import DatePicker from 'react-datepicker';
import { Toaster } from '../utils/toaster';
import { toast } from "react-toastify";
import {observer, inject} from 'mobx-react';
import { Credential } from '../verifier';
import { IssuancesComponent } from './issuance.js';
import { styles } from '../common-styles';
import { isValidForm, showFormErrors } from '../utils/form-utils';
import TextTruncate from 'react-text-truncate';
import 'react-datepicker/dist/react-datepicker.css';

const moment = require('moment');

export class RevokeForm extends Component {
    constructor(props){
        super(props);
        this.state = {recipient: '', credentialName: '', institutionId: 'bf-edu-123', formErrors: [], loading: false, formError: false};
        this.accountManager = new AccountManager();
    }
    handleRevoke = async() => {
        this.setState({loading: true});
        const formErrorPredicates = [
            !this.accountManager.isValidPublicKey(this.state.recipient) ? new Error('Invalid public key for recipient') : null,
            this.state.credentialName === '' ? new Error('Credential name is required') : null
        ]
        const validationResult = isValidForm(formErrorPredicates);
        if(validationResult.valid) {
            try {
                await this.props.handle(this.state)
                this.setState({loading: false, recipient: '', credentialName: '', formErrors: [], formError: false});
            } catch (error) {
                console.log(error);
                this.setState(previousState => {
                    const {loading, formErrors, formError, ...state} = previousState;
                    return {...state, loading: false, formErrors: [], formError: false};
                });
            }       
        } else {
            this.setState(previousState => {
                const {loading, formErrors, formError, ...state} = previousState;
                return {...state, loading: false, formErrors: validationResult.errors, formError: true};
            });
        }
    }
    
    render() {
        return (
            <Form loading={this.state.loading} size='large' style={{paddingTop: 25}} error={this.state.formError ? true : undefined}>
                <Grid.Row style={{display: 'flex', alignItems: 'center'}}>
                    <Form.Field style={{width: '100%'}} error={this.state.formError ? true : undefined}>
                        <input style={styles.inputField} value={this.state.recipient} placeholder='Recipient Public Key' onChange={(e) => this.setState({recipient: e.target.value})} />
                    </Form.Field>
                    <PublicKeyInfo />
                </Grid.Row>
                <Grid.Row style={{display: 'flex', alignItems: 'center'}}>
                    <Form.Field style={{width: '100%'}} error={this.state.formError ? true : undefined}>
                        <input style={styles.inputField} value={this.state.credentialName}  placeholder='Credential Name' onChange={(e) => this.setState({credentialName: e.target.value})} />
                    </Form.Field>
                    <CredentialNameInfo />
                </Grid.Row>
                <Grid.Row style={{display: 'flex', alignItems: 'center'}}>
                    <Form.Field style={{width: '100%'}} value={this.state.institutionId}>
                        <input style={styles.inputField} disabled placeholder={this.state.institutionId} onChange={(e) => this.setState({institutionId: e.target.value})} />
                    </Form.Field>
                    <InstitutionIDInfo />
                </Grid.Row>
                <Form.Group>
                    <Form.Button disabled={this.state.credentialName === '' || this.state.recipient === ''} style={styles.buttonDark} onClick={this.handleRevoke} size='large' content='Revoke' icon='ban' labelPosition='right'/>
                </Form.Group>
                {this.state.formErrors.length > 0 ? this.showFormErrors() : null}
            </Form>
        )
    }
}


@inject('accountStore')
@observer
export class IssueForm extends Component {
    constructor(props){
        super(props);

        this.initialState = {
            value: 'issue', 
            recipient: '', 
            dateEarned: null, 
            name: '', 
            image: null, 
            expiration: null, 
            formErrors: [], 
            formError: false, 
            loading: false,
            issueSuccess: {
                success: false,
                transaction: null
            }
        };

        this.state = {...this.initialState};
        this.showNoAccountWarning = this.showNoAccountWarning.bind(this);
        this.accountStore = this.props.accountStore;
        this.accountManager = new AccountManager();

        this.demoCred = {
            school: 'BadgeForce University',
            institutionId: 'bf-edu-123'
        }

        this.options = [
            {label: 'Issue a credential', name: 'radioGroup', value: 'issue'},
            {label: 'Revoke a credential', name: 'radioGroup', value: 'revoke'},
            {label: 'Issued Credential Receipts', name: 'radioGroup', value: 'issuance'},
        ];

        this.issue = this.issue.bind(this);
        this.handleIssue = this.handleIssue.bind(this);
        this.renderIssueForm = this.renderIssueForm.bind(this);
        this.handleRevoke = this.handleRevoke.bind(this);
        this.formLoading = this.formLoading.bind(this);
        this.renderSelection = this.renderSelection.bind(this);
        this.renderOptions = this.renderOptions.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getSuccessMessage = this.getSuccessMessage.bind(this);
        this.getInfoPopup = this.getInfoPopup.bind(this);
        this.renderInfoComponent = this.renderInfoComponent.bind(this);
        this.issuanceInfo = this.issuanceInfo.bind(this);

        this.test = this.test.bind(this);

        this.revokedescscription = `With BadgeForce issuers have the power to Revoke credentials on the fly. Revoking a credential will make any subsequent
            verifications fail. You must be the owner of the account that issued the credential in order to Revoke it. Make sure your active account is indeed 
            the account you used when you initially issued the credential.
        `

        this.issuanceDescription = `In the BadgeForce ecosystem when a credential is issued an Issuance is created and written to the blockchain
            state. This data will be immutable (it cannot be deleted or modified in any way), and replicated throughout the entire blockchain network. 
            An Issuance serves two purposes; It is a pivotal part of the credential verification process because it contains data from a credential created
            during the origin issuing. It also serves as a receipt record for issuer's, allowing them to look back at their entire issuing history, using the 
            data inside an Issuance an issuer can recreate any credential they ever issued while at the same time only storing a tiny amount of data on chain
            keeping our BadgeForce blockchain scalable without sacrificing security.  
        `
    }

    handleChange(e, { value }) {
        this.setState({ value })
    }

    issueBtn = () => <Button size='small' style={styles.buttonReallyDarkNoBorder} onClick={() => this.setState({value: 'issue'})} content='issue a credential' active={this.state.value === 'issue'} />
    revokeBtn = () => <Button size='small' style={styles.buttonDarkNoBorder} onClick={() => this.setState({value: 'revoke'})} content='revoke a credential' active={this.state.value === 'revoke'} />
    issuanceBtn = () => <Button size='small' style={styles.buttonKindaLightNoBorder} onClick={() => this.setState({value: 'issuance'})} content='view past issued credentials' active={this.state.value === 'issuance'} />

    renderOptions() {
        return (
            <Button.Group widths={4} vertical={this.props.mobile || this.props.tablet ? true : false }>
                {this.state.value === 'issue' ? null : this.issueBtn()}
                {this.state.value === 'revoke' ? null : this.revokeBtn()}
                {this.state.value === 'issuance' ? null : this.issuanceBtn()}
            </Button.Group>
        );
    }


    renderSelection() {
        switch (this.state.value) {
            case 'issue':
                return this.renderIssueForm.bind(this).call();
            case 'revoke':
                return <RevokeForm handle={this.handleRevoke}/>
            case 'issuance':
                return <IssuancesComponent />
            default:
                break;
        }
    }

    revokeInfo = () => {
        return <Header.Content as='h3' className='content-subheader' content={this.revokedescscription} />
    }

    issuanceInfo() {
        return <Header.Content as='h3' className='content-subheader' content={this.issuanceDescription} />
    }

    async handleRevoke(data) {
        this.setState({results: null, visible: false, loading: true});
        try {
            await this.accountStore.current.revoke(data);
            this.setState(prevState => ({
                loading: {toggle: false, message: ''},
                visible: true,
                toastId: null,
            }));
        } catch (error) {
            console.log(error);
            Toaster.notify('Something Went Wrong While Revoking, Double Check Your Data!', toast.TYPE.ERROR);
            this.setState({results: null, visible: false, loading: false});
        }
    }

    test() {
       const coreData = {
            ...this.demoCred,
            recipient: this.props.accountStore.current.account.publicKey,
            dateEarned: moment().unix().toString(),
            expiration: moment().unix().toString(),
            issuer: this.accountStore.current.account.publicKey,
            name: 'test',
        } 
        const transactor = new Transactor();
        transactor.test(coreData, this.accountStore.current.account.signer);
    }
    
    async issue(data) {
        try {
            const {recipient, dateEarned, name, expiration, image} = data;
            const coreData = {
                ...this.demoCred,
                recipient,
                dateEarned: dateEarned.unix().toString(),
                expiration: expiration.unix().toString(),
                issuer: this.accountStore.current.account.publicKey,
                name,
                image
            }
            const transaction = await this.accountStore.current.issueAcademic(coreData);
            return {retry: false, transaction};
        } catch (error) {
            return {retry: true, error: error};
        }
    }

    uploadImage = (e) => {
        this.formLoading(true)
        try {
            const files = document.getElementById('credentialImageUpload').files;
            this.accountManager.readFile(files.item(0), this.accountManager.fileTypes.image, results => {
                this.setState({loading: false, image: results});
                Toaster.notify('Image uploaded', toast.TYPE.SUCCESS);
                document.getElementById('credentialImageUpload').value = '';
            });
        } catch (error) {
            this.formLoading(false);
            console.log(error);
            Toaster.notify('Could not upload image, try again or issue without it', toast.TYPE.ERROR);
        }
    }

    formLoading(loading) {
        this.setState({loading});
    }

    async handleIssue() {
        this.formLoading(true)
        const formErrorPredicates = [
            !this.accountManager.isValidPublicKey(this.state.recipient) ? new Error('Public key is empty or invalid') : null,
            this.state.name === '' ? new Error('Credential name is required') : null,
            this.state.dateEarned === null ? new Error('Date earned is required') : null,
            this.state.expiration && moment().isAfter(this.state.expiration) ? new Error('Cannot issue an expired credential') : null
        ]
        const validationResult = isValidForm(formErrorPredicates);
        if(validationResult.valid) {
            const results = await this.issue(this.state);
            if(results.retry) {
                this.setState(previousState => {
                    const {loading, formErrors, formError, ...state} = previousState;
                    return {...state, loading: false, formErrors: [results.error], formError: true};
                });
            } else {
                const {issueSuccess, ...state} = this.initialState;
                this.setState({...state, issueSuccess: {
                    success: true,
                    transaction: results.transaction
                }});
            }
        } else {
            this.setState(previousState => {
                const {loading, formErrors, formError, ...state} = previousState;
                return {...state, loading: false, formErrors: validationResult.errors, formError: true};
            });
        }

        console.log(this.state);
    }

    getInfoPopup(info) {
        const btnStyle = {color: styles.buttonLight.color, backgroundColor: 'inherit'};
        return (
            <Popup
                trigger={<Button size='mini' style={btnStyle} circular icon='question' />}
                content={info}
                on='click' 
                hideOnScroll 
                position='right center'/>
        );
    }

    getSuccessMessage() {
        return (
            <span>
                <Message style={{display: 'flex'}} 
                    success 
                    header={'Success'} 
                    content={
                            <TextTruncate
                                style={{overflow: 'hidden'}}
                                line={1}
                                truncateText="…"
                                text={this.state.issueSuccess.transaction.metaData.description}
                                textTruncateChild={<a href='' onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('success_info_popup').click()
                                }} >read more</a>} />
                        }
                />
                <Popup content={this.state.issueSuccess.transaction.metaData.description} trigger={<a id={'success_info_popup'} />} hideOnScroll on='click' position='bottom left' />
            </span>
        );
    }

    renderIssueForm() {
        return (
            <Form loading={this.state.loading} style={{paddingTop: 25}} size='large' error={this.state.formError ? true : undefined}>
                <Grid.Row style={{display: 'flex', alignItems: 'center'}}>
                    <Form.Field style={{width: '100%'}}  error={this.state.formError ? true : undefined} value={this.state.recipient} >
                        <input style={styles.inputField} value={this.state.recipient} placeholder='Recipient Public Key' onChange={(e) => this.setState({recipient: e.target.value})} />
                    </Form.Field>
                    <PublicKeyInfo />
                </Grid.Row>

                <Grid.Row style={{display: 'flex', alignItems: 'center'}}>
                    <Form.Field style={{width: '100%'}} error={this.state.formError ? true : undefined} value={this.state.name}>
                        <input style={styles.inputField} value={this.state.name} placeholder='Credential Name' onChange={(e) => this.setState({name:  e.target.value})} />
                    </Form.Field>
                    <CredentialNameInfo />
                </Grid.Row>

                <Grid.Row style={{display: 'flex', alignItems: 'center'}}>
                    <Form.Field style={{width: '100%'}}>
                        <input disabled style={{...styles.inputField, color: '#0000'}}  placeholder={this.demoCred.institutionId} />
                    </Form.Field>
                    <InstitutionIDInfo />
                </Grid.Row>
                <Form.Group widths='equal'>
                    <Form.Field error={this.state.formError ? true : undefined} style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
                        <DatePicker selected={this.state.dateEarned} placeholderText="Date Earned" onChange={(dateEarned) => this.setState({dateEarned})} />
                    </Form.Field>
                    <Form.Field error={this.state.formError ? true : undefined} style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
                        <DatePicker selected={this.state.expiration} placeholderText="Expiration" onChange={(expiration) => this.setState({expiration})} />
                    </Form.Field>
                </Form.Group>
                <Form.Group>
                    <Form.Button style={styles.buttonDark} disabled={this.props.warn || this.state.loading} onClick={this.handleIssue} size='large' content='Issue Credential' icon='send' labelPosition='right'/>
                    <Form.Button style={styles.buttonLight} disabled={this.props.warn || this.state.loading} size='large' content='Upload Image' icon='upload' labelPosition='right' onClick={() => document.getElementById('credentialImageUpload').click()} />
                </Form.Group>
                <input type="file" id='credentialImageUpload' onChange={this.uploadImage} style={{display: 'none'}} />  
                {this.state.formErrors.length > 0 ? showFormErrors(this.state.formErrors) : null}
                {this.state.issueSuccess.success ? this.getSuccessMessage() : null}
            </Form>
        )
    }

    preview = () => <Credential full={false} data={{...this.demoCred, issuer: this.props.accountStore.current.account.publicKey, ...this.state}} />

    renderInfoComponent() {
        if(this.props.mobile) {
            return null
        }
        switch (this.state.value) {
            case 'issue':
                return this.preview()
            case 'revoke':
                return this.revokeInfo();
            case 'issuance': 
                return this.issuanceInfo();
            default:
                break;
        }
    }

    render() {
        return (
            <Segment style={{
                padding: this.props.mobile ? '1em 0em' : '4em 0em'
            }} vertical>
                <Grid container stackable>
                    <Grid.Row >
                        <Grid.Column width={this.state.value === 'issuer' ? 12 : 8}>
                            <Item>
                                {/* <Form.Button size='large' content='TEST ' onClick={this.test} /> */}
                                <Item.Header textAlign='left' as={Header}>
                                    <Header.Content as={this.props.mobile ? 'h3' : 'h1'} className='content-header' content={`${this.state.value.charAt(0).toUpperCase()}${this.state.value.substring(1)}`} />
                                </Item.Header>
                                {this.renderInfoComponent()}
                            </Item>
                        </Grid.Column>
                        <Grid.Column floated='right' width={this.state.value === 'issuer' ? 6 : 8}>
                            <Form.Group style={{display: 'flex', justifyContent: 'space-evenly', flexStart: 'end'}} inline>
                                {this.renderOptions()}
                            </Form.Group>
                            {this.renderSelection()}
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Segment>
        );
    }

    showNoAccountWarning() {
        return (
            <Message 
                header='No account detected'
                content='Could not detect an account, please import or create one using the Accounts tab'
            />
        )
    }
}