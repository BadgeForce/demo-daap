import React, { Component } from 'react';
import  { AccountManager } from '../../badgeforcejs-lib/account_manager';
import { Issuer as Account } from '../../badgeforcejs-lib/issuer';
import { toast, ToastContainer } from "react-toastify";
import TextTruncate from 'react-text-truncate';
import {observer, inject} from 'mobx-react';
import { sleep } from '../verifier';
import { Toaster } from '../utils/toaster';
import { AccountOptions } from './accout-forms';
import { styles } from '../common-styles';
import { 
    Grid, Confirm, Input, Item, Menu, Button, 
    Dimmer, Loader, Modal, Header, Icon, Dropdown, Popup } from 'semantic-ui-react'
import 'animate.css/animate.min.css';

const Fuse = require('fuse.js');
const moment = require('moment');
class PasswordConfirm extends Component {
    state = {password: ''};
    confirmInput = (onchange) => {
        return (
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 50}}>
              <Input type='password' onChange={onchange} placeholder='re-enter password' />
            </div>
        );
    }
    render() {
        return (
            <Confirm
              header='Invalid Password For Account'
              content={this.confirmInput((e, password) => {
                this.setState({password})
              })}
              onCancel={this.props.cancel}
              onConfirm={() => this.props.finish(this.state.password)}
              open={this.props.open}
              confirmButton='Try Again'
          />
        );
    }
}
@inject('accountStore')
@inject('badgeStore')
@observer
export default class Accounts extends Component {
    constructor(props) {
        super(props);
        this.state = {
            results: null,
            loading: {toggle: true, message: ''},
            visible: false,
            confirmPassword: {show: false, account: null, loading: false},
            error: null,
            transactions: [],
            toastId: null,
            newAccountInfo: {
                name: '',
                privateKey: '',
                show: false
            }
        }

        this.importAccount = this.importAccount.bind(this);
        this.importAccountDone = this.importAccountDone.bind(this);
        this.importAccountRaw = this.importAccountRaw.bind(this);
        this.createAccount = this.createAccount.bind(this);
        this.downloadKeyPair = this.downloadKeyPair.bind(this);
        this.showNewAccountInfo = this.showNewAccountInfo.bind(this);
        this.newAccountModal = this.newAccountModal.bind(this);
        this.accountManager = new AccountManager();
    }
    async componentDidMount() {
        if(this.props.accountStore.current === null) {
            this.setState({loading: {toggle: true, message: 'Loading accounts from browser storage'}})
            const noAccounts = await this.props.accountStore.getCache();
            console.log(this.props.accountStore.current)
            await sleep(1);
            if(noAccounts) {
                Toaster.notify("No accounts found in storage, create one using accounts tab", toast.TYPE.WARNING);
            }
            this.setState({loading: {toggle: false, message: ''}})
        } else {
            this.setState({loading: {toggle: false, message: ''}})
        }
    }

    newAccountModal() {
        return (
            <Modal
                open={this.state.newAccountInfo.show}
                basic
                size='small'>
                <Header icon='key' content='Copy your privatekey somewhere safe, use it to import your account later' />
                <Modal.Content>
                    <h3>Name: {this.state.newAccountInfo.name}</h3>
                    <h3>Privatekey: {this.state.newAccountInfo.privateKey}</h3>
                </Modal.Content>
                <Modal.Actions>
                    <Button style={styles.buttonKindaLightNoBorder} onClick={() => this.setState({newAccountInfo: {
                        name: '',
                        privateKey: '',
                        show: false
                    }})} inverted>
                    <Icon name='checkmark' /> Got it
                    </Button>
                </Modal.Actions>
            </Modal>
        );
    }

    showNewAccountInfo(info) {
        this.setState({newAccountInfo: {
            name: info.name,
            privateKey: info.privateKey,
            show: true
        }});
    }

    async createAccount(password, name) {
        try {
            const account = new Account(this.accountManager.newAccount(password, name));
            await this.props.accountStore.newAccount(account);
            this.props.accountStore.switchAccount(account.account.publicKey);
            if(!this.props.mobile) {
                this.downloadKeyPair(name);
            }
            this.showNewAccountInfo({
                name, 
                privateKey: account.account.signer._privateKey.asHex()
            });
        } catch (error) {
            console.log(error);
            Toaster.notify('Something Went Wrong!', toast.TYPE.ERROR);
        }
    }
    downloadKeyPair(name) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(this.props.accountStore.current.account.downloadStr);
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href",     dataStr);
        downloadAnchorNode.setAttribute("download", `badgeforce-keys${name ? name: moment().toISOString()}.json`);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
    async importAccountDone (error, account) {
        document.getElementById('accountUpload').value = '';
        let stateUpdate = {loading: {toggle: false, message: ''}};
        const handleErr = (error) => {
            if(error) {
                let invalidPassword = this.accountManager.accountErrors.invalidPassword,
                    notifyMsg,
                    confirm;

                if(error.message === invalidPassword) {
                    notifyMsg = 'Account password invalid, try re-enter password';
                    confirm = true;
                } else {
                    notifyMsg = error.message;
                    confirm = false;
                }

                Toaster.notify(notifyMsg, toast.TYPE.ERROR);
                this.setState({...stateUpdate, confirmPassword: {show: confirm, account}});
                return true;
            } else {
                return false;
            }
        }
        
        if(!handleErr(error)) {
            await this.props.accountStore.newAccount(new Account(account));
            await this.props.accountStore.switchAccount(account.publicKey);
            this.setState(stateUpdate);
            Toaster.notify('Account Imported', toast.TYPE.SUCCESS);
        }   
    }
    async importAccount(e, password) {
        this.setState({results: null, visible: false, loading: true});
        try {
            const files = document.getElementById('accountUpload').files;
            this.accountManager.importAccount(files, password, this.importAccountDone);
        } catch (error) {
            console.log(error);
            await this.sleep(3);
            this.setState({
                loading: {toggle: false, message: ''},
                // error
            });
        }
    }

    async importAccountRaw (privateKey) {
        let account;
        try {
            account = new Account(AccountManager.fromRaw(privateKey));
        } catch (error) {
            console.log(error);
            Toaster.notify('Could not create account from private key, make sure key is correct', toast.TYPE.ERROR);
            return;
        }

        try {
            console.log(account);
            await this.props.accountStore.newAccount(account);
            this.props.accountStore.switchAccount(account.account.publicKey);
        } catch (error) {
            console.log(error);
            Toaster.notify('Something Went Wrong!', toast.TYPE.ERROR);
            return;
        }
    }

    async sleep(duration) {
        return new Promise(resolve => {
			setTimeout(() => {
			    resolve();
            }, duration*1000)
		});
    }
  
    render() {
        return (
            <Grid.Column>
                {this.newAccountModal()}
                <Dimmer inverted active={this.state.loading.toggle}>
                    <Loader indeterminate>{this.state.loading.message}</Loader>
                </Dimmer>
                <ToastContainer autoClose={5000} />
                <PasswordConfirm loading={this.state.confirmPassword.loading} finish={async (password) => {
                        this.setState({confirmPassword: {loading: false}});
                        try {
                            const account = this.accountManager.decryptAccount(password.value, this.state.confirmPassword.account);
                            await this.props.accountStore.newAccount(new Account(account, this.handleTransactionsUpdate.bind(this)));
                            Toaster.notify('Account imported', toast.TYPE.SUCCESS);
                            this.setState({confirmPassword: {show: false, account: null, loading: false}});
                        } catch (error) {
                            console.log(error)
                            this.setState({confirmPassword: {show: false, account: null, loading: false}});
                            if(error.message === this.accountManager.accountErrors.invalidPassword) {
                                Toaster.notify('Account Password still Invalid, try re-uploading', toast.TYPE.ERROR);
                            } else {
                                Toaster.notify('Something went wrong', toast.TYPE.ERROR);
                            }
                        }
                    }}
                    open={this.state.confirmPassword.show} 
                    cancel={() => this.setState({confirmPassword: {show: false, account: null, loading: false}})
                }
                />
                <AccountOptions
                    {...this.props}
                    handleImportAccount={this.importAccount} 
                    handleCreateAccount={this.createAccount}
                    handleImportRaw={this.importAccountRaw}/>
            </Grid.Column>
        );
    }
}

@inject('accountStore')
@inject('badgeStore')
@observer
export class AccountNavMenuItem extends Component {
    searchOptions = {keys: ['name', 'publickey']}

    constructor(props) {
        super(props);
        this.state = { open: false, options: [], loading: false }
        this.getActive = this.getActive.bind(this);
        this.setActive = this.setActive.bind(this);
        this.getOption = this.getOption.bind(this);
    }

    async componentDidMount() {
        if(!this.props.accountStore.loadingCache && this.props.accountStore.current === null) {
            this.setState({loading: true})
            await this.props.accountStore.getCache();
            await sleep(1);
            this.setState({loading: false})
        } 
    }
    
    isReady() {
        return !this.state.loading && !this.props.accountStore.loadingCache;
    }

    setActive(e, {value}) {
        this.props.accountStore.switchAccount(value);
    }

    getActive() {
        const { account } = this.props.accountStore.current || {account: null};
        const text = account ? `Active: ${account.name || account.publicKey}` : 'No accounts found';
        return (
            <TextTruncate
                style={{cursor: 'pointer'}}
                onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(this.props.full ? "full__accountPopup__": "__accountPopup__").click()
                }}
                line={2}
                truncateText="…"
                text={text}
            />
        );
    }

    getOption({account: {name, publicKey}}) {
        return { key: publicKey, text: name || `${publicKey.substring(0, 15)}...`, value: publicKey, name, publickey: publicKey }
    }

    search = (options, query) => new Fuse(options, this.searchOptions).search(query);

    getPopUp() {
        const { account } = this.props.accountStore.current || {account: null};
        return (
            <Popup 
                trigger={<a id={this.props.full ? "full__accountPopup__": "__accountPopup__"} />} 
                hideOnScroll 
                content={account ? account.publicKey : ''} 
                on='click'
                position='top center'
            />
        );
    }

    render() {
        const fullStyling = {
            display: 'flex', 
            justifyContent: 'space-around', 
            width: '100%', 
            color: styles.navMenuHeader.color,
            flexDirection: 'column'
        };

        return (
            <Menu.Menu as={this.props.full ? Grid.Row : Menu.Item} style={this.props.full ? fullStyling: styles.navMenuHeader}>
                <Item.Header>
                    <Header style={styles.navMenuHeader} as={'h3'}>
                        <Header.Content>
                            {this.isReady() ? this.getPopUp() : null}
                            {this.isReady() ? this.getActive() : 'Loading Accounts'}
                        </Header.Content>
                    </Header>
                </Item.Header>
                <Dropdown
                    style={{backgroundColor: styles.buttonLight.backgroundColor}}
                    scrolling
                    autoComplete='on'
                    fluid
                    onChange={this.setActive}
                    search={this.search}
                    selection
                    loading={this.state.loading || this.props.accountStore.loadingCache}
                    className='icon accounts-dropdown'
                    options={this.props.accountStore.accounts.map(this.getOption)}
                    noResultsMessage='No accounts found matching search input'
                    placeholder='Search by account name or public key' />
            </Menu.Menu>
        );
    }
}