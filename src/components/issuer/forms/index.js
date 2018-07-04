import React, { Component } from 'react';
import { Form, Message } from 'semantic-ui-react'
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
        this.state = {recipient: '', credentialName: '', institutionId: this.props.demoCred.institutionId, formErrors: [], formError: false};
        this.showFormErrors = this.showFormErrors.bind(this);
        this.isValidForm = this.isValidForm.bind(this);
        this.accountManager = new AccountManager();
    }
    handleRevoke = async() => {
        if(this.isValidForm()){
            try {
                await this.props.handle(this.state)
                this.setState({recipient: '', credentialName: '', formErrors: [], formError: false});
            } catch (error) {
                console.log(error);
                this.setState({recipient: '', credentialName: '', formErrors: [], formError: false});
            }       
        }
    }
    isValidForm() {
        const errors = [
            !this.accountManager.isValidPublicKey(this.state.recipient) ? new Error('Invalid public key for recipient') : null,
            this.state.credentialName === '' ? new Error('Credential name is required') : null
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
    render(){
        return (
            <Form size='large' style={{paddingTop: 25}} error={this.state.formError ? true : undefined}>
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

export class NewAccountForm extends Component {
    state = {password: '', name: '', formErrors: [], formError: false};
    createAccount = async () => {
        if(this.isValidForm()) {
            try {
                await this.props.handleCreateAccount(this.state.password, this.state.name);
                this.setState({password: '', name: '', formErrors: [], formError: false});
            } catch (error) {
                console.log(error);
                this.setState({password: '', name: '', formErrors: [], formError: false});
            }
        }
    }
    isValidForm = () => {
        this.setState({formErrors: []})
        let formErrors = this.state.formErrors;
        return [
            this.state.password === '' ? new Error('Password cannot be empty') : null
        ].filter(error => error !== null)
        .map(error => {
            if(error) this.setState({formErrors: [...formErrors, error], formError: true});
            return error;
        }).length === 0;
    }
    showFormErrors = () => {
        return (
            <Message error
                header='Problems with your input'
                content={<Message.List items={this.state.formErrors.map((error, i) => {
                    return <Message.Item key={i} content={error.message} />
                })} />}
            />
        )
    }
    importAccount = async (e) => {
        try {
            await this.props.handleImportAccount(e, this.state.password);
            this.setState({password: '', name: '', formErrors: [], formError: false});
        } catch (error) {
            console.log(error);
            this.setState({password: '', name: '', formErrors: [], formError: false});
        }
    }
    render(){
        return (
            <Form size='large' style={{paddingTop: 25}} error={this.state.formError ? true : undefined}>
                <Form.Input error={this.state.formError ? true : undefined} type='password' placeholder='very strong password' value={this.state.password}  mobile={4} tablet={12} onChange={(e, password) => this.setState({password: password.value})} />
                <Form.Input placeholder='Name for account' value={this.state.name}  mobile={4} tablet={12} onChange={(e, name) => this.setState({name: name.value})} />
                <Form.Group style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Form.Button style={{display: 'flex', alignSelf: 'flex-start'}} color='blue' onClick={this.createAccount} size='large' content='Create Account' icon='key' labelPosition='right'/>
                    <Form.Button style={{display: 'flex', alignSelf: 'flex-start'}} color='orange' onClick={() => document.getElementById('accountUpload').click()} size='large' content='Upload Account File' icon='upload' labelPosition='right'/>
                </Form.Group>
                {this.state.formErrors.length > 0 ? this.showFormErrors() : null}
                <input type="file" id="accountUpload" onChange={this.importAccount} style={{display: 'none'}} />  
            </Form>
        )
    }
}

@inject('accountStore')
@observer
export class IssueForm extends Component {
    constructor(props){
        super(props);
        this.state = {recipient: '', dateEarned: null, name: '', image: null, expiration: null, formErrors: [], formError: false, loading: false};
        this.showFormErrors = this.showFormErrors.bind(this);
        this.showNoAccountWarning = this.showNoAccountWarning.bind(this);
        this.isValidForm = this.isValidForm.bind(this);

        this.accountStore = this.props.accountStore;
        this.accountManager = new AccountManager();
    }
    uploadImage = (e) => {
        this.setState({loading: true});
        try {
            const files = document.getElementById('credentialImageUpload').files;
            this.accountManager.readFile(files.item(0), this.accountManager.fileTypes.image, results => {
                console.log(results);
                this.setState({loading: false, image: results});
                Toaster.notify('Image uploaded', toast.TYPE.SUCCESS);
                document.getElementById('credentialImageUpload').value = '';
            });
        } catch (error) {
            console.log(error);
            Toaster.notify('Could not upload image, try again or issue without it', toast.TYPE.ERROR);
        }
    }
    handleIssue = async () => {
        if(this.isValidForm()) {
            console.log(this.state);
            await this.props.handle(this.state);
            this.setState({recipient: '', dateEarned: null, name: '', expiration: null, image: null, formErrors: [], formError: false});
        }
    }

    getPreview = () => {
        return <Credential full={false} data={{...this.props.demo, issuer: this.accountStore.current.account.publicKey, ...this.state}} />
    }

    isValidForm() {
        this.setState({formErrors: []})
        let formErrors = [];
        return [
            !this.accountManager.isValidPublicKey(this.state.recipient) ? new Error('Invalid public key for recipient') : null,
            this.state.name === '' ? new Error('Credential name is required') : null,
            this.state.dateEarned === null ? new Error('Date earned is required') : null,
            this.state.expiration && moment().isAfter(this.state.expiration) ? new Error('Cannot issue an expired credential') : null
        ].filter(error => error !== null)
        .map(error => {
            if(error) this.setState({formErrors: [...formErrors, error], formError: true});
            return error;
        }).length === 0;
    }

    showNoAccountWarning() {
        return (
            <Message 
                header='No account detected'
                content='Could not detect an account, please import or create one using the Accounts tab'
            />
        )
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
                {this.state.formErrors.length > 0 ? this.showFormErrors() : null}
                {this.props.warn ? this.showNoAccountWarning() : this.getPreview()}
            </Form>
        )
    }
}