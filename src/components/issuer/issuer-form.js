import React, { Component } from 'react';
import { Form, Message, Grid, Segment, Item, Header } from 'semantic-ui-react'
import  { AccountManager } from '../../badgeforcejs-lib/account_manager';
import DatePicker from 'react-datepicker';
import { Toaster } from '../utils/toaster';
import { toast } from "react-toastify";
import {observer, inject} from 'mobx-react';
import { Credential, sleep } from '../verifier';
import { styles } from '../common-styles';
import { isValidForm, showFormErrors } from '../utils/form-utils';
import 'react-datepicker/dist/react-datepicker.css';
import HeaderContent from 'semantic-ui-react/dist/commonjs/elements/Header/HeaderContent';

const moment = require('moment');

export class RevokeForm extends Component {
    constructor(props){
        super(props);
        this.state = {recipient: '', credentialName: '', institutionId: 'badgeforce-uni-123456', formErrors: [], loading: false, formError: false};
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
    
    render() {
        return (
            <Form loading={this.state.loading} size='large' style={{paddingTop: 25}} error={this.state.formError ? true : undefined}>
                <Form.Field error={this.state.formError ? true : undefined}>
                    <input style={styles.inputField} value={this.state.recipient} placeholder='Recipient Public Key' onChange={(e, recipient) => this.setState({recipient: recipient.value})} />
                </Form.Field>
                <Form.Field error={this.state.formError ? true : undefined}>
                    <input style={styles.inputField} value={this.state.credentialName}  placeholder='Credential Name' onChange={(e, credentialName) => this.setState({credentialName: credentialName.value})} />
                </Form.Field>
                <Form.Field value={this.state.institutionId}>
                    <input style={styles.inputField} disabled placeholder={this.state.institutionId} onChange={(e, institutionId) => this.setState({institutionId: institutionId.value})} />
                </Form.Field>
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
        this.state = {value: 'issue', recipient: '', dateEarned: null, name: '', image: null, expiration: null, formErrors: [], formError: false, loading: false};
        this.showNoAccountWarning = this.showNoAccountWarning.bind(this);
        this.accountStore = this.props.accountStore;
        this.accountManager = new AccountManager();

        this.demoCred = {
            school: 'BadgeForce University',
            institutionId: 'badgeforce-uni-123456'
        }

        this.options = [
            {label: 'Issue a credential', name: 'radioGroup', value: 'issue'},
            {label: 'Revoke a credential', name: 'radioGroup', value: 'revoke'},
        ];

        this.issue = this.issue.bind(this);
        this.renderIssueForm = this.renderIssueForm.bind(this);
        this.handleRevoke = this.handleRevoke.bind(this);
        this.formLoading = this.formLoading.bind(this);
        this.renderSelection = this.renderSelection.bind(this);
        this.renderOptions = this.renderOptions.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.revokedescscription = `With BadgeForce issuers have the power to Revoke credentials on the fly. Revoking a credential will make any subsequent
            verifications fail. You must be the owner of the account that issued the credential in order to Revoke it. Make sure your active account is indeed 
            the account you used when you initially issued the credential.
        `
    }

    handleChange(e, { value }) {
        this.setState({ value })
    }

    renderOptions() {
        return this.options.map((o, i) => {
            return (
                <Form.Radio
                    label={o.label}
                    name={o.name}
                    value={o.value}
                    checked={this.state.value === o.value}
                    onChange={this.handleChange}
                    key={i}
                />
            );
        })
    }

    renderSelection() {
        switch (this.state.value) {
            case 'issue':
                return this.renderIssueForm.bind(this).call();
            case 'revoke':
                return <RevokeForm handle={this.handleRevoke}/>
            default:
                break;
        }
    }

    revokeInfo = () => {
        return <Header.Content as='h3' className='content-subheader' content={this.revokedescscription} />

    }

    async handleRevoke(data) {
        this.setState({results: null, visible: false, loading: true});
        try {
            const watcher = await this.accountStore.current.revoke(data);
            this.setState(prevState => ({
                loading: {toggle: false, message: ''},
                visible: true,
                toastId: null,
                transactions: [...prevState.transactions, watcher]
            }));
        } catch (error) {
            Toaster.notify('Something Went Wrong While Revoking!', toast.TYPE.ERROR);
            this.setState({results: null, visible: false, loading: false});
        }
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
            await this.accountStore.current.issueAcademic(coreData);
        } catch (error) {
            Toaster.notify(error.message, toast.TYPE.ERROR);
            throw error;
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
            const retry = await this.issue(this.state);
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

    renderIssueForm() {
        return (
            <Form loading={this.state.loading} style={{paddingTop: 25}} size='large' error={this.state.formError ? true : undefined}>
                <Form.Field error={this.state.formError ? true : undefined} value={this.state.recipient} >
                    <input style={styles.inputField} placeholder='Recipient Public Key' onChange={({value}) => this.setState({recipient: value})} />
                </Form.Field>
                <Form.Field error={this.state.formError ? true : undefined} value={this.state.name}>
                    <input style={styles.inputField}  placeholder='Credential Name' onChange={({value}) => this.setState({name: name.value})} />
                </Form.Field>
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
            </Form>
        )
    }

    render() {
        return (
            <Segment style={{
                padding: '4em 0em'
            }} vertical>
                <Grid container stackable>
                    <Grid.Row >
                        <Grid.Column width={6}>
                            <Item>
                                <Item.Header textAlign='left' as={Header}>
                                    <Header.Content as='h1' className='content-header' content={'Issuer'} />
                                </Item.Header>  
                                {this.state.value === 'issue' ? <Item.Content as={Credential} full={false} data={{...this.props.demo, issuer: this.props.accountStore.current.account.publicKey, ...this.state}} /> : 
                                    this.revokeInfo()
                                }
                            </Item>
                        </Grid.Column>
                        <Grid.Column floated='right' width={8}>
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