import React, { Component } from 'react';
import { Form, Grid, Menu, Button, Message } from 'semantic-ui-react'
import { isValidForm, showFormErrors, successMessage } from '../utils/form-utils';
import { styles } from '../common-styles';
import { AccountNavMenuItem } from './index';
import 'react-datepicker/dist/react-datepicker.css';
import { AccountManager } from '../../badgeforcejs-lib/account_manager';

export class NewAccountForm extends Component {
    constructor(props) {
        super(props);
        this.state = {password: '', name: '', success: false, formErrors: [], formError: false, loading: false};
        this.createAccount = this.createAccount.bind(this);
    }

    async createAccount() {
        this.formLoading(true);
        const formErrorPredicates = [
            this.state.password === '' ? new Error('Password cannot be empty') : null,
            this.state.name === '' ? new Error('Account Name cannot be empty') : null
        ]
        const validationResult = isValidForm(formErrorPredicates);
        console.log(validationResult)
        if(validationResult.valid) {
            try {
                await this.props.handleCreateAccount(this.state.password, this.state.name);
                this.setState({loading: false, password: '', name: '', success: true, formErrors: [], formError: false});
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
            <Form loading={this.state.loading} size='large' style={{paddingTop: 25}} value={this.state.name} error={this.state.formError ? true : undefined}>
                <Form.Field error={this.state.formError ? true : undefined}  value={this.state.name} >
                    <input style={styles.inputField} placeholder='Name for account' value={this.state.name} onChange={(e) => this.setState({name: e.target.value})}/>
                </Form.Field>
                <Form.Field error={this.state.formError ? true : undefined} value={this.state.password}>
                    <input style={styles.inputField} type='password' value={this.state.password} placeholder='Very strong password'  onChange={(e, password) => this.setState({password: e.target.value})} />
                </Form.Field>
                <Form.Group>
                    <Form.Button style={styles.buttonDark} disabled={this.state.password === '' || this.state.name === ''} 
                        onClick={this.createAccount.bind(this)} size='large' content='Create Account' icon='key' labelPosition='right'/>
                </Form.Group>
                {this.state.formErrors.length > 0 ? showFormErrors(this.state.formErrors) : null}
                {this.state.succes ? <Message header='Account created successfully' content='You can now issue badges, and view the ones you own. Use the navigation buttons at the top to get going!' success />: null}
            </Form>
        )
    }
}

export class RawPrivateKeyForm extends Component {
    state = {privateKey: '', sucess: false, formErrors: [], formError: false, loading: false, error: {toggle: false, header: '', message: ''}};
    formLoading(loading) {
        this.setState({loading, formError: false, success: false, error: {toggle: false, header: '', message: ''}});
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
                this.setState({loading: false, success: true, privateKey: '', formErrors: [], formError: false});
            } catch (error) {
                this.setState(previousState => {
                    const {loading, formErrors, formError, ...state} = previousState;
                    const errMsg = Object.values(new AccountManager().accountErrors).find(msg => msg === error.message)
                    const err = {toggle: true, header: 'Could not import account at this time', message: errMsg || 'Try again'}
                    return {...state, loading: false, formErrors: [], formError: false, error: err};
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
            <Grid.Row>
                <Form loading={this.state.loading} size='large' style={{paddingTop: 25}} error={this.state.formError ? true : undefined}>
                    <Form.Field error={this.state.formError ? true : undefined} value={this.state.privateKey}  >
                        <input style={styles.inputField} value={this.state.privateKey} placeholder='Privatekey' 
                        onChange={(e, privateKey) => this.setState({privateKey: e.target.value})} />
                    </Form.Field>
                    <Form.Group>
                        <Form.Button style={styles.buttonDark} size='large' disabled={this.state.password === '' || this.state.privateKey === ''}  
                            onClick={this.importRaw} content='Import Account' icon='key' labelPosition='right'/>
                    </Form.Group>
                    {this.state.formErrors.length > 0 ? showFormErrors(this.state.formErrors) : null}
                </Form>
                {this.state.error.toggle ? <Message header={this.state.error.header} content={this.state.error.message} error />  : null }
                {this.state.success ? <Message header='Account imported successfully' success />  : null } 
            </Grid.Row>
        )
    }
}
export class AccountFileUpload extends Component {
    state = {password: '', success: false, formErrors: [], formError: false, loading: false, error: {toggle: false, header: '', message: ''}};
    importAccount = async (e) => {
        this.setState({formError: false, success: false, loading: false, error: {toggle: false, header: '', message: ''}})
        const formErrorPredicates = [
            this.state.password === '' ? new Error('Password cannot be empty') : null
        ];
        const validationResult = isValidForm(formErrorPredicates);
        if(validationResult.valid) {
            try {
                await this.props.handleImportAccount(e, this.state.password);
                this.setState({loading: false, success: true, password: '', formErrors: [], formError: false});
            } catch (error) {
                this.setState(previousState => {
                    const {loading, formErrors, formError, ...state} = previousState;

                    const errMsg = Object.values(new AccountManager().accountErrors).find(msg => msg === error.message)
                    const err = {toggle: true, header: 'Could not import account at this time', message: errMsg || 'Try again'}
                    return {...state, success: false, loading: false, formErrors: [], formError: false, error: err};
                });
            }
        } else {
            this.setState(previousState => {
                const {loading, formErrors, formError, ...state} = previousState;
                return {...state, success: false, loading: false, formErrors: validationResult.errors, formError: true};
            });
        }
    }
    formLoading(loading) {
        this.setState({loading});
    }
    render() {
        return(
            <Grid.Row>
                <Form loading={this.state.loading} size='large' style={{paddingTop: 25}} error={this.state.formError ? true : undefined}>
                    <Form.Field error={this.state.formError ? true : undefined} value={this.state.password}>
                        <input style={styles.inputField} type='password' placeholder='Enter your password'  onChange={(e, password) => this.setState({password: e.target.value})} />
                    </Form.Field>
                    <Form.Group>
                        <Form.Button style={styles.buttonDark} disabled={this.state.password === ''} 
                        onClick={() => document.getElementById('accountUpload').click()} size='large' content='Upload Account File' icon='upload' labelPosition='right'/>
                    </Form.Group>
                    {this.state.formErrors.length > 0 ? showFormErrors(this.state.formErrors) : null}
                    <input type="file" id="accountUpload" onChange={this.importAccount} style={{display: 'none'}} />  
                </Form>
                {this.state.error.toggle ? <Message header={this.state.error.header} content={this.state.error.message} error />  : null }
                {this.state.success ? <Message header='Account imported successfully' success />  : null }    
            </Grid.Row>
        );
    }
}

export class AccountOptions extends Component {
    constructor(props) {
        super(props);

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

    createAccountBtn = () => <Button size='small' style={styles.buttonReallyDarkNoBorder} onClick={() => this.setState({value: 'form'})} content='Create New Account' active={this.state.value === 'form'} />
    uploadAccountBtn = () => <Button size='small' style={styles.buttonDarkNoBorder} onClick={() => this.setState({value: 'file'})} content='Upload Encrypted Account File' active={this.state.value === 'file'} />
    rawAccountBtn = () => <Button size='small' style={styles.buttonKindaLightNoBorder} onClick={() => this.setState({value: 'raw'})} content='Import from Private Key' active={this.state.value === 'raw'} />

    renderOptions() {
        return (
            <Button.Group widths={4} vertical={this.props.mobile || this.props.tablet ? true : false }>
                {this.state.value === 'form' ? null : this.createAccountBtn()}
                {this.state.value === 'file' ? null : this.uploadAccountBtn()}
                {this.state.value === 'raw' ? null : this.rawAccountBtn()}
            </Button.Group>
        );
    }

    render() {
        return (
            <Grid.Column>
                <Menu size='large' borderless style={{boxShadow: 'none', border: 'none'}}>
                    <AccountNavMenuItem full {...this.props} />
                </Menu>
                {this.renderOptions()}
                {this.renderSelection()}
            </Grid.Column>
        );
    }
}