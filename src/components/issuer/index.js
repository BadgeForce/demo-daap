import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react'
import { Toaster } from '../utils/toaster';
import { Route, Redirect } from 'react-router-dom'
import {observer, inject} from 'mobx-react';
import { IssueForm } from './issuer-form';
import 'animate.css/animate.min.css';

export class Issuer extends Component {
    // handleTransactionsUpdate(transaction) {
    //     const transactions = this.state.transactions.map(tx => {
    //         return tx.id === transaction.id ? transaction : tx;
    //     })
    //     this.setState({transactions});
    // }

    // async handleRevoke(data) {
    //     this.setState({results: null, visible: false, loading: true});
    //     try {
    //         const watcher = await this.accountStore.current.revoke(data);
    //         this.setState(prevState => ({
    //             loading: {toggle: false, message: ''},
    //             visible: true,
    //             toastId: null,
    //             transactions: [...prevState.transactions, watcher]
    //         }));
    //     } catch (error) {
    //         Toaster.notify('Something Went Wrong While Revoking!', toast.TYPE.ERROR);
    //         this.setState({results: null, visible: false, loading: false});
    //     }
    // }
    
    render() {
        return (
            <Grid.Column>
                <IssueForm />
            </Grid.Column>
        );
    }
}

