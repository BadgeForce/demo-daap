import React, { Component } from 'react';
import { Loader, Icon, Feed } from 'semantic-ui-react'

export class Transaction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.id,
            data: this.props.data
        }

        this.statusColors = {
            COMMITTED: {color: 'green', icon: 'check circle'},
            INVALID: {color: 'red', icon: 'warning circle'}, 
            PENDING: {color: 'orange', icon: 'wait'}
        }
    }
    render() {
        return (
            <Feed.Event>
                <Feed.Label>
                    <Icon name={this.statusColors[this.state.data.status].icon} color={this.statusColors[this.state.data.status].color}/>
                </Feed.Label>
                <Feed.Content>
                    <Feed.Summary>
                        <Feed.Event>{this.state.data.metaData.description}</Feed.Event>
                        <Feed.Date>{this.state.data.metaData.date}</Feed.Date>
                    </Feed.Summary>
                    <Feed.Meta>
                        <Feed.Label>
                            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start'}}>
                                <Icon name='hourglass half' />
                                {`Transaction Status: ${this.state.data.status}`}  
                                {this.state.data.status === 'PENDING' ? <Loader style={{paddingLeft: 10}} active size='mini' inline/> : null}
                            </div>
                        </Feed.Label>
                    </Feed.Meta>
                </Feed.Content>
            </Feed.Event>
        )
    }
}

export class Transactions extends Component {
    render() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
                <Feed>
                    {this.props.transactions.map((watcher, i) => {
                        return (
                            <Transaction data={watcher.transaction} id={watcher.id} key={i}/>
                        );
                    })}
                </Feed>
            </div>
        )
    }
}