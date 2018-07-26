import React, { Component } from 'react';
import { Form, Grid, Menu } from 'semantic-ui-react'
import { isValidForm, showFormErrors } from '../utils/form-utils';
import { styles } from '../common-styles';
import { AccountNavMenuItem } from './index';
import 'react-datepicker/dist/react-datepicker.css';

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
        console.log(validationResult)
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
                <Form.Field error={this.state.formError ? true : undefined} value={this.state.name} >
                    <input style={styles.inputField} placeholder='Name for account' onChange={(e) => this.setState({name: e.target.value})}/>
                </Form.Field>
                <Form.Field error={this.state.formError ? true : undefined} value={this.state.password}>
                    <input style={styles.inputField} type='password' placeholder='Very strong password'  onChange={(e, password) => this.setState({password: e.target.value})} />
                </Form.Field>
                <Form.Group>
                    <Form.Button style={styles.buttonDark} disabled={this.state.password === '' || this.state.name === ''} 
                        onClick={this.createAccount.bind(this)} size='large' content='Create Account' icon='key' labelPosition='right'/>
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
                <Form.Field error={this.state.formError ? true : undefined} value={this.state.privateKey}  >
                    <input style={styles.inputField} placeholder='Privatekey' 
                    onChange={(e, privateKey) => this.setState({privateKey: e.target.value})} />
                </Form.Field>
                <Form.Group>
                    <Form.Button style={styles.buttonDark} size='large' disabled={this.state.password === '' || this.state.privateKey === ''}  
                        onClick={this.importRaw} content='Import Account' icon='key' labelPosition='right'/>
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

    render() {
        return (
            <Grid.Column>
                <Menu size='large' borderless style={{boxShadow: 'none', border: 'none'}}>
                    <AccountNavMenuItem full />
                </Menu>
                <Form.Group inline>
                    {this.renderOptions()}
                </Form.Group>                    
                {this.renderSelection()}
            </Grid.Column>
        );
    }
}