import React, { Component } from 'react';
import { Grid, Confirm, Input, Tab, Menu, Button, Dimmer, Loader, Modal, Header, Icon } from 'semantic-ui-react'
import  { AccountManager } from '../../badgeforcejs-lib/account_manager';
import { Issuer as Account } from '../../badgeforcejs-lib/issuer';
import { toast, ToastContainer } from "react-toastify";
import {observer, inject} from 'mobx-react';
import { sleep } from '../verifier';
import { Toaster } from '../utils/toaster';
import { RevokeForm, AccountOptions, IssueForm } from './forms';
import { Transactions } from './transactions';
import { isMobile } from './detect-browser';
import 'animate.css/animate.min.css';

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
export class Issuer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            results: null,
            loading: {toggle: false, message: ''},
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

        

        this.handleIssue = this.handleIssue.bind(this);
        this.handleRevoke = this.handleRevoke.bind(this);
        this.handleTransactionsUpdate = this.handleTransactionsUpdate.bind(this);
        this.importAccount = this.importAccount.bind(this);
        this.importAccountDone = this.importAccountDone.bind(this);
        this.createAccount = this.createAccount.bind(this);
        this.downloadKeyPair = this.downloadKeyPair.bind(this);
        this.showNewAccountInfo = this.showNewAccountInfo.bind(this);
        this.newAccountModal = this.newAccountModal.bind(this);

        this.accountStore = this.props.accountStore;
        this.demoCred = {
            school: 'BadgeForce University',
            institutionId: '123456'
        }

        this.accountsTabRef = React.createRef();
        this.panes = [
            { menuItem: 'Issue', render: () => <Tab.Pane>{<IssueForm notify={Toaster.notify} warn={this.accountStore.current === null} handle={this.handleIssue} />}</Tab.Pane> },
            { menuItem: 'Revoke', render: () => <Tab.Pane>{<RevokeForm demoCred={this.demoCred} handle={this.handleRevoke} />}</Tab.Pane> },
            { menuItem: <Menu.Item ref={this.accountsTabRef} as={Button} key='accounts'>Accounts</Menu.Item>, 
                render: () => {
                    const handleCreateAccount = this.createAccount.bind(this)
                    const handleImportAccount = this.importAccount.bind(this)
                    const props = {handleCreateAccount, handleImportAccount};
                    return <Tab.Pane>{<AccountOptions handleCreateAccount={async (password, name) => await this.createAccount(password, name)} />}</Tab.Pane>
            }}
        ]

        this.accountManager = new AccountManager();
    }
    async componentWillMount() {
        if(this.accountStore.current === null) {
            this.setState({loading: {toggle: true, message: 'Loading accounts from browser storage'}})
            const accountCache = await this.accountStore.getCache();
            await sleep(1);
            if(accountCache.length === 0) {
                Toaster.notify("No accounts found in storage, create one using accounts tab", toast.TYPE.WARNING);
                this.setState({loading: {toggle: false, message: ''}})
            } else {
                accountCache.forEach(async account => {
                    await this.props.accountStore.newAccount(new Account(account, this.handleTransactionsUpdate.bind(this)));
                });
                this.setState({loading: {toggle: false, message: ''}})
            }
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
                    <Button color='green' onClick={() => this.setState({newAccountInfo: {
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

    showNewAccountInfo(account) {
        this.setState({newAccountInfo: {
            name: account.name,
            privateKey: account.privateKey,
            show: true
        }});
    }

    async createAccount(password, name) {
        try {
            const account = new Account(this.accountManager.newAccount(password));
            await this.accountStore.newAccount(account, this.handleTransactionsUpdate.bind(this));
            if(!isMobile()) {
                this.downloadKeyPair(name);
            }
            this.showNewAccountInfo(account);
        } catch (error) {
            console.log(error);
            Toaster.notify('Something Went Wrong!', toast.TYPE.ERROR);
        }
    }
    downloadKeyPair(name) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(this.accountStore.current.account.downloadStr);
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

                if(error.message === invalidPassword){
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
            Toaster.notify('Account Imported', toast.TYPE.SUCCESS);
            await this.accountStore.newAccount(new Account(account, this.handleTransactionsUpdate.bind(this)));
            this.setState(stateUpdate);
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

    async sleep(duration) {
        return new Promise(resolve => {
			setTimeout(() => {
			    resolve();
            }, duration*1000)
		});
    }

    handleTransactionsUpdate(transaction) {
        const transactions = this.state.transactions.map(tx => {
            return tx.id === transaction.id ? transaction : tx;
        })
        this.setState({transactions});
    }

    async handleIssue(data) {
        console.log(data);
        this.setState({results: null, visible: false, loading: true});
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

            const watcher = await this.accountStore.current.issueAcademic(coreData);
            console.log(watcher);
            this.setState(prevState => ({
                loading: {toggle: false, message: ''},
                visible: true,
                toastId: null,
                transactions: [...prevState.transactions, watcher]
            }));
        } catch (error) {
            Toaster.notify('Something Went Wrong While Issuing!', toast.TYPE.ERROR);
            this.setState({
                results: null,
                loading: {toggle: false, message: ''},
                error,
                toastId: null
            });
        }
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
            console.log(error);
            Toaster.notify('Something Went Wrong While Revoking!', toast.TYPE.ERROR);
            this.setState({results: null, visible: false, loading: false});
        }
    }
    
    render() {
        return (
            <Grid.Column>
                {this.newAccountModal()}
                <Dimmer active={this.state.loading.toggle}>
                    <Loader indeterminate>{this.state.loading.message}</Loader>
                </Dimmer>
                <ToastContainer autoClose={5000} />
                <PasswordConfirm loading={this.state.confirmPassword.loading} finish={async (password) => {
                        this.setState({confirmPassword: {loading: false}});
                        try {
                            const account = this.accountManager.decryptAccount(password.value, this.state.confirmPassword.account);
                            await this.accountStore.newAccount(new Account(account, this.handleTransactionsUpdate.bind(this)));
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
                {!this.state.loading.toggle ? 
                    <Grid.Column>
                        <Tab menu={{ fluid: true, vertical: false}} panes={this.panes} />
                        <Transactions transactions={this.state.transactions}/>
                    </Grid.Column> : 
                    null
                }
            </Grid.Column>
        );
    }
}
