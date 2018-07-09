import React, { Component } from 'react';
import { Form, Message, Radio, Grid } from 'semantic-ui-react'
import  { AccountManager } from '../../../badgeforcejs-lib/account_manager';
import DatePicker from 'react-datepicker';
import { Toaster } from '../../utils/toaster';
import { toast } from "react-toastify";
import {observer, inject} from 'mobx-react';
import { Credential } from '../../verifier';

import 'react-datepicker/dist/react-datepicker.css';

const moment = require('moment');

export class RevokeForm extends Component {
    constructor(props){
        super(props);
        this.state = {recipient: '', credentialName: '', institutionId: this.props.demoCred.institutionId, formErrors: [], loading: false, formError: false};
        this.showFormErrors = this.showFormErrors.bind(this);
        this.isValidForm = this.isValidForm.bind(this);
        this.accountManager = new AccountManager();
    }
    handleRevoke = async() => {
        this.formLoading(true);
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
    
    render(){
        return (
            <Form loading={this.state.loading} size='large' style={{paddingTop: 25}} error={this.state.formError ? true : undefined}>
                <Form.Input error={this.state.formError ? true : undefined} value={this.state.recipient}  mobile={4} tablet={12} placeholder='Recipient Public Key' onChange={(e, recipient) => this.setState({recipient: recipient.value})} />
                <Form.Input error={this.state.formError ? true : undefined} value={this.state.credentialName}  mobile={4} tablet={12} placeholder='Credential Name' onChange={(e, credentialName) => this.setState({credentialName: credentialName.value})} />
                <Form.Input value={this.state.institutionId} disabled mobile={4} tablet={12} placeholder='Institution ID provided for all credentials issued using demo BadgeForce University Issuer' onChange={(e, institutionId) => this.setState({institutionId: institutionId.value})} />
                <Form.Group style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Form.Button style={{display: 'flex', alignSelf: 'flex-start'}} color='red' onClick={this.handleRevoke} size='large' content='Revoke' icon='ban' labelPosition='right'/>
                </Form.Group>
                {this.state.formErrors.length > 0 ? this.showFormErrors() : null}
            </Form>
        )
    }
}

const isValidForm = (predicates) => {
    const formErrors = predicates.filter(error => error !== null)
    .map(error => error);

    return {
        valid: formErrors.length === 0,
        errors: formErrors
    }
}

const showFormErrors = (errors) => {
    return (
        <Message error
            header='Problems with your input'
            content={<Message.List items={errors.map((error, i) => {
                return <Message.Item key={i} content={error.message} />
            })} />}
        />
    )
}

export class NewAccountForm extends Component {
    constructor(props) {
        super(props);
        this.state = {password: '', name: '', formErrors: [], formError: false, loading: false};
        this.createAccount = this.createAccount.bind(this);
    }

    async createAccount() {
        this.formLoading(true);
        const formErrorPredicates = [
            this.state.password === '' ? new Error('Password cannot be empty') : null,
            this.state.name === '' ? new Error('Account Name cannot be empty') : null
        ]
        const validationResult = isValidForm(formErrorPredicates);
        if(validationResult.valid) {
            try {
                await this.props.handleCreateAccount(this.state.password, this.state.name);
                this.setState({loading: false, password: '', name: '', formErrors: [], formError: false});
            } catch (error) {
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
    formLoading(loading) {
        this.setState({loading});
    }
    render(){
        return (
            <Form loading={this.state.loading} size='large' style={{paddingTop: 25}} error={this.state.formError ? true : undefined}>
                <Form.Input error={this.state.formError ? true : undefined} placeholder='Name for account' value={this.state.name}  mobile={4} tablet={12} onChange={(e, name) => this.setState({name: name.value})} />
                <Form.Input error={this.state.formError ? true : undefined} type='password' placeholder='Very strong password' value={this.state.password}  mobile={4} tablet={12} onChange={(e, password) => this.setState({password: password.value})} />
                <Form.Group style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Form.Button disabled={this.state.password === '' || this.state.name === ''} 
                        style={{display: 'flex', alignSelf: 'flex-start'}} color='blue' 
                        onClick={this.createAccount} size='large' content='Create Account' icon='key' labelPosition='right'/>
                </Form.Group>
                {this.state.formErrors.length > 0 ? showFormErrors(this.state.formErrors) : null}
            </Form>
        )
    }
}

export class RawPrivateKeyForm extends Component {
    state = {privateKey: '', formErrors: [], formError: false, loading: false};
    formLoading(loading) {
        this.setState({loading});
    }
    importRaw = async () => {
        this.formLoading(true);
        const formErrorPredicates = [
            this.state.privateKey === '' ? new Error('PrivateKey cannot be empty') : null
        ]
        const validationResult = isValidForm(formErrorPredicates);
        if(validationResult.valid) {
            try {
                await this.props.handleImportRaw(this.state.privateKey);
                this.setState({loading: false, privateKey: '', formErrors: [], formError: false});
            } catch (error) {
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

    render(){
        return (
            <Form loading={this.state.loading} size='large' style={{paddingTop: 25}} error={this.state.formError ? true : undefined}>
                <Form.Input error={this.state.formError ? true : undefined} 
                    placeholder='Privatekey' value={this.state.privateKey}  
                    mobile={4} tablet={12} 
                    onChange={(e, privateKey) => this.setState({privateKey: privateKey.value})} />
                <Form.Group style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Form.Button disabled={this.state.password === '' || this.state.privateKey === ''}  
                        style={{display: 'flex', alignSelf: 'flex-start'}} color='blue' 
                        onClick={this.importRaw} size='large' content='Import Account' icon='key' labelPosition='right'/>
                </Form.Group>
                {this.state.formErrors.length > 0 ? showFormErrors(this.state.formErrors) : null}
            </Form>
        )
    }
}
export class AccountFileUpload extends Component {
    state = {password: '', formErrors: [], formError: false, loading: false};
    importAccount = async (e) => {
        const formErrorPredicates = [
            this.state.password === '' ? new Error('Password cannot be empty') : null
        ];
        const validationResult = isValidForm(formErrorPredicates);
        if(validationResult.valid) {
            try {
                await this.props.handleImportAccount(e, this.state.password);
                this.setState({loading: false, password: '', formErrors: [], formError: false});
            } catch (error) {
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
    formLoading(loading) {
        this.setState({loading});
    }
    render() {
        return(
            <Form loading={this.state.loading} size='large' style={{paddingTop: 25}} error={this.state.formError ? true : undefined}>
                <Form.Input error={this.state.formError ? true : undefined} type='password' placeholder='Enter your password' value={this.state.password}  mobile={4} tablet={12} onChange={(e, password) => this.setState({password: password.value})} />
                <Form.Group style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Form.Button disabled={this.state.password === ''} 
                    style={{display: 'flex', alignSelf: 'flex-start'}} color='orange' 
                    onClick={() => document.getElementById('accountUpload').click()} size='large' content='Upload Account File' icon='upload' labelPosition='right'/>
                </Form.Group>
                {this.state.formErrors.length > 0 ? showFormErrors(this.state.formErrors) : null}
                <input type="file" id="accountUpload" onChange={this.importAccount} style={{display: 'none'}} />  
            </Form>
        );
    }
}

export class AccountOptions extends Component {
    constructor(props) {
        super(props);
        this.options = [
            {label: 'Upload Encrypted Account File', name: 'radioGroup', value: 'file'},
            {label: 'Create New Account', name: 'radioGroup', value: 'form'},
            {label: 'Import from Private Key', name: 'radioGroup', value: 'raw'},
        ];

        this.state = {
            value: 'form'
        };

        this.renderSelection = this.renderSelection.bind(this);
        this.renderOptions = this.renderOptions.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.renderAccountFileUpload = this.renderAccountFileUpload.bind(this);
        this.renderRawForm = this.renderRawForm.bind(this);
    }

    renderAccountFileUpload() {
        return (
            <AccountFileUpload handleImportAccount={this.props.handleImportAccount} />
        );
    }

    renderNewAccountForm() {
        return (
            <NewAccountForm handleCreateAccount={this.props.handleCreateAccount} />
        );
    }
    renderRawForm() {
        return (
            <RawPrivateKeyForm handleImportRaw={this.props.handleImportRaw} />
        );
    }

    renderSelection() {
        switch (this.state.value) {
            case 'file':
                return this.renderAccountFileUpload();
            case 'form':
                return this.renderNewAccountForm();
            case 'raw': 
                return this.renderRawForm();
            default:
                break;
        }
    }

    handleChange(e, { value }) {
        this.setState({ value })
    }
    renderOptions() {
        return this.options.map((o, i) => {
            return (
                <Form.Field key={i} >
                    <Radio
                        label={o.label}
                        name={o.name}
                        value={o.value}
                        checked={this.state.value === o.value}
                        onChange={this.handleChange}
                    />
                </Form.Field>
            );
        })
    }

    render() {
        return (
            <Grid.Row>
                <Form>
                    {this.renderOptions()}
                </Form>
                {this.renderSelection()}
            </Grid.Row>
        );
    }
}

@inject('accountStore')
@observer
export class IssueForm extends Component {
    constructor(props){
        super(props);
        this.state = {recipient: '', dateEarned: null, name: '', image: null, expiration: null, formErrors: [], formError: false, loading: false};
        this.showNoAccountWarning = this.showNoAccountWarning.bind(this);
        this.accountStore = this.props.accountStore;
        this.accountManager = new AccountManager();
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

    handleIssue = async () => {
        this.formLoading(true)
        const formErrorPredicates = [
            !this.accountManager.isValidPublicKey(this.state.recipient) ? new Error('Invalid public key for recipient') : null,
            this.state.name === '' ? new Error('Credential name is required') : null,
            this.state.dateEarned === null ? new Error('Date earned is required') : null,
            this.state.expiration && moment().isAfter(this.state.expiration) ? new Error('Cannot issue an expired credential') : null
        ]
        const validationResult = isValidForm(formErrorPredicates);
        if(validationResult.valid) {
            const retry = await this.props.handle(this.state);
            if(retry) {
                this.setState(previousState => {
                    const {loading, formErrors, formError, ...state} = previousState;
                    return {...state, loading: false, formErrors: [], formError: false};
                });
            } else {
                this.setState({loading: false, recipient: '', dateEarned: null, name: '', expiration: null, image: null, formErrors: [], formError: false});
            }
        } else {
            this.setState(previousState => {
                const {loading, formErrors, formError, ...state} = previousState;
                return {...state, loading: false, formErrors: validationResult.errors, formError: true};
            });
        }
    }

    getPreview = () => {
        return <Credential full={false} data={{...this.props.demo, issuer: this.accountStore.current.account.publicKey, ...this.state}} />
    }

    showNoAccountWarning() {
        return (
            <Message 
                header='No account detected'
                content='Could not detect an account, please import or create one using the Accounts tab'
            />
        )
    }
    render(){
        return (
            <Form loading={this.state.loading} size='large' error={this.state.formError ? true : undefined}>
                <Form.Input error={this.state.formError ? true : undefined} value={this.state.recipient}  mobile={4} tablet={12} placeholder='Recipient Public Key' onChange={(e, recipient) => this.setState({recipient: recipient.value})} />
                <Form.Input error={this.state.formError ? true : undefined} value={this.state.name}  mobile={4} tablet={12} placeholder='Credential Name' onChange={(e, name) => this.setState({name: name.value})} />
                <Form.Group widths='equal'>
                    <Form.Field error={this.state.formError ? true : undefined} style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
                        <h4 style={{marginRight: 10}}>Date Earned:</h4>              
                        <DatePicker selected={this.state.dateEarned} placeholderText="Date Earned" onChange={(dateEarned) => this.setState({dateEarned})} />
                    </Form.Field>
                    <Form.Field error={this.state.formError ? true : undefined} style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
                        <h4 style={{marginRight: 10}}>Expiration:</h4>
                        <DatePicker selected={this.state.expiration} placeholderText="Expiration" onChange={(expiration) => this.setState({expiration})} />
                    </Form.Field>
                </Form.Group>
                <Form.Group style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Form.Button disabled={this.props.warn || this.state.loading} style={{display: 'flex', alignSelf: 'flex-start'}} color='blue' onClick={this.handleIssue} size='large' content='Issue Credential' icon='send' labelPosition='right'/>
                    <Form.Button disabled={this.props.warn || this.state.loading} style={{display: 'flex', alignSelf: 'flex-start'}} color='orange' size='large' content='Upload Image' icon='upload' labelPosition='right' onClick={() => document.getElementById('credentialImageUpload').click()} />
                </Form.Group>
                <input type="file" id='credentialImageUpload' onChange={this.uploadImage} style={{display: 'none'}} />  
                {this.state.formErrors.length > 0 ? showFormErrors(this.state.formErrors) : null}
                {this.props.warn ? this.showNoAccountWarning() : this.getPreview()}
            </Form>
        )
    }
}