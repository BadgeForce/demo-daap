import React, { Component } from 'react';
import { Loader, Icon, Feed, Dimmer, Grid, Segment, Header, Label, Popup } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react';
import { reaction } from 'mobx';
import TextTruncate from 'react-text-truncate';
import { sleep } from '../verifier';
import { styles } from '../common-styles';
import { InfomaticModal } from '../common/info';


export class Transaction extends Component {
    constructor(props) {
        super(props);
        
        this.statusColors = {
            COMMITTED: {color: 'green', icon: 'check'},
            INVALID: {color: 'red', icon: 'warning circle'}, 
            PENDING: {color: 'orange', icon: 'wait'}
        }
        this.truncate = this.truncate.bind(this);
        this.getPopUp = this.getPopUp.bind(this);
        this.popupKey = `${this.props.id}-transaction-popup__`
    }
    getInfo() {
        let text, content; 
        text = this.props.transaction.metaData.description
        content = <span>
                    <p style={{wordWrap: 'break-word'}}>{this.props.transaction.metaData.description}</p>
                    <p style={{wordWrap: 'break-word'}}>Date: {this.props.transaction.metaData.date}</p>
                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start'}}>
                        <Icon name='hourglass half' />
                        {`Transaction Status: ${this.props.transaction.status}`}  
                        {this.props.transaction.status === 'PENDING' ? <Loader style={{paddingLeft: 10}} active size='mini' inline/> : null}
                    </div>
                </span>
        return (
            <TextTruncate
                style={{overflow: 'hidden', color: 'rgb(47, 81, 191)'}}
                line={1}
                truncateText=''
                text={text}
                textTruncateChild={<InfomaticModal 
                    iconName={this.statusColors[this.props.transaction.status].icon}
                    header='Issue Transaction'
                    content={content}
                    trigger={<p style={{color: '#569fff', cursor: 'pointer'}}>...more</p>}
                />}
            />
        );
    }
    truncate(data) {
        return (
            <TextTruncate
                style={{overflow: 'hidden'}}
                line={1}
                truncateText="…"
                text={data}
                textTruncateChild={<a href='' onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(this.popupKey).click()
                }} >read more</a>}
            />
        );
    }

    getPopUp(key) {
        return (
            <Popup content={key} trigger={<a id={this.popupKey} />} hideOnScroll on='click' position='top center' />
        );
    }

    render() {
        console.log(this.props.transaction)
        return (
            <Feed.Event>
                <Feed.Label>
                    <Icon name={this.statusColors[this.props.transaction.status].icon} color={this.statusColors[this.props.transaction.status].color}/>
                </Feed.Label>
                <Feed.Content>
                    {this.getPopUp(this.props.transaction.metaData.description)}
                    <Feed.Summary>
                        <Feed.Event as={'h6'}>
                            <Header>
                                <Header.Content as='div' content={this.getInfo()} />
                            </Header>
                        </Feed.Event>
                        <Feed.Date>{this.props.transaction.metaData.date}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Meta>
                        <Feed.Label>
                            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start'}}>
                                <Icon name='hourglass half' />
                                {`Transaction Status: ${this.props.transaction.status}`}  
                                {this.props.transaction.status === 'PENDING' ? <Loader style={{paddingLeft: 10}} active size='mini' inline/> : null}
                            </div>
                        </Feed.Label>
                    </Feed.Meta>
                </Feed.Content>
            </Feed.Event>
        )
    }
}

@inject('accountStore')
@observer
export class Transactions extends Component {
    
    constructor(props) {
        super(props);
        this.accountStore = this.props.accountStore;
        this.state = { loading: true, transactions: [] };
        this.bindTransactionUpdates = this.bindTransactionUpdates.bind(this);
        this.disposeAccountChange = null;
    }

    bindTransactionUpdates(transaction) {
        console.log(transaction)
        const transactions = this.state.transactions.filter(t => t.id !== transaction.id);
        this.setState({transactions: [...transactions, transaction]});
        if(this.props.updateCount) {
            this.props.updateCount(this.state.transactions.length);
        }
    }

    async handleLoading(loading) {
        if(!this.props.toggleLoading) {
            this.setState({loading});
            return;
        } 

        if(loading) {
            await this.props.toggleLoading(true);
        } else {
            await this.props.toggleLoading(false);
            this.props.updateCount(this.state.transactions.length);
            this.props.updateTransactions(this.state.transactions);
        }
    }

    async loadTransactions() {
        await this.handleLoading(true);
        this.setState({transactions: []});
        try {
            this.props.accountStore.current.bindTxtUpdates(this.bindTransactionUpdates);
            await this.props.accountStore.current.loadTransactions();
            await this.handleLoading(false);
        } catch (error) {
            console.log(error.message);
            await this.handleLoading(false);
        }
    }

    async componentDidMount() {
        await this.loadTransactions();
        const accountChange = this.accountChangeReaction();
        this.disposeAccountChange = reaction(accountChange.prop, accountChange.action);
    }

    accountChangeReaction() {
        return {
            prop: () => this.props.accountStore.current, 
            action: async current => {
                await this.loadTransactions();
            }
        };
    }

    // componentWillUnmount() {
    //     this.disposeAccountChange()
    // }

    renderTransactions() {
        if(this.state.transactions.length > 0) {
            return (
                <Feed>
                    {this.state.transactions.map((transaction, i) => {
                        return (
                            <Transaction transaction={transaction.transaction} id={transaction.id} key={i}/>
                        );
                    })}
                </Feed>
            );
        } else {
            return null;
        }
    }

    renderLoader() {
        if(this.props.toggleLoading) {
            return
        }
        return (
            <Dimmer active>
                <Loader>Loading Transaction History</Loader>
            </Dimmer>
        );
    }

    render() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
                {!this.state.loading ? this.renderTransactions() : this.renderLoader()}
            </div>
        )
    }
}

@inject('accountStore')
@observer
export class TransactionNavList extends Transactions {
    constructor(props) {
        super(props);
        this.state = {loading: true, count: 0, transactions: []}
        this.toggleLoading = this.toggleLoading.bind(this);
        this.updateCount = this.updateCount.bind(this);
        this.updateTransactions = this.updateTransactions.bind(this);
        this.renderList = this.renderList.bind(this);
    }

    async toggleLoading(loading) {
        await sleep(3);
        this.setState({loading});
    }

    updateCount(count) {
        this.setState({count});
    }

    updateTransactions(transactions) {
        this.setState({transactions});
    }
    renderList() {
        return (
            <Grid.Column style={{height: '100%'}}>
                <Segment.Group style={{border: 'none', boxShadow: 'none'}}>
                    <Segment style={{border: 'none'}}>
                        <Header style={styles.navMenuHeader} as={'h4'}>
                            {this.state.loading ? <Icon loading name='spinner' /> : null }
                            <Header.Content>
                                Transaction Log
                                {!this.state.loading && !this.props.accountStore.loadingCache ? <Label style={styles.navMenuItem} circular>{this.state.count}</Label> : null }
                            </Header.Content>
                        </Header>
                    </Segment>
                    <Segment style={{backgroundColor: 'inherit', border: 'none'}} secondary>
                        <Feed>
                            {this.state.transactions.map((transaction, i) => {
                                return (
                                    <Transaction transaction={transaction.transaction} id={transaction.id} key={i}/>
                                );
                            })}
                        </Feed>
                        <Transactions 
                            toggleLoading={this.toggleLoading} 
                            updateCount={this.updateCount} 
                            updateTransactions={this.updateTransactions} style={{display: 'none'}}/>
                    </Segment>
                </Segment.Group>
            </Grid.Column>
        );
    }
    render() {
        return (
            !this.props.mobile ? null : null
        );
    }
}

// fb3ad6a8786f8d9d255d5e470f2d86ca243868e6d5bf3b4af2338eff1d046bbc