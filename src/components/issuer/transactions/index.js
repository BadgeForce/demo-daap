import React, { Component } from 'react';
import { Loader, Icon, Feed, Dimmer } from 'semantic-ui-react'
import { inject, observer } from 'mobx-react';
import { reaction } from 'mobx';
import { sleep } from '../../verifier';


export class Transaction extends Component {
    constructor(props) {
        super(props);
        
        this.statusColors = {
            COMMITTED: {color: 'green', icon: 'check circle'},
            INVALID: {color: 'red', icon: 'warning circle'}, 
            PENDING: {color: 'orange', icon: 'wait'}
        }
       
        console.log(this.props.transaction);
    }
    render() {
        return (
            <Feed.Event>
                <Feed.Label>
                    <Icon name={this.statusColors[this.props.transaction.status].icon} color={this.statusColors[this.props.transaction.status].color}/>
                </Feed.Label>
                <Feed.Content>
                    <Feed.Summary>
                        <Feed.Event>{this.props.transaction.metaData.description}</Feed.Event>
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
        // console.log(transaction)
        const transactions = this.state.transactions.filter(t => t.id !== transaction.id);
        this.setState({transactions: [...transactions, transaction]});
    }

    async loadBadges() {
        this.setState({transactions: []});
        try {
            this.props.accountStore.current.bindTxtUpdates(this.bindTransactionUpdates);
            await this.props.accountStore.current.loadTransactions();
            this.setState({loading: false}); 
        } catch (error) {
            console.log(error);
            this.setState({loading: false}); 
        }
    }

    async componentDidMount() {
        await this.loadBadges();
        const accountChange = this.accountChangeReaction();
        this.disposeAccountChange = reaction(accountChange.prop, accountChange.action);
    }

    accountChangeReaction() {
        return {
            prop: () => this.props.accountStore.current, 
            action: async current => {
                this.setState({loading: true});
                await sleep(1);
                await this.loadBadges();
            }
        };
    }

    componentWillUnmount() {
        this.disposeAccountChange()
    }

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

// fb3ad6a8786f8d9d255d5e470f2d86ca243868e6d5bf3b4af2338eff1d046bbc