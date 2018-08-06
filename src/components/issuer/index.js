import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react'
import { IssueForm } from './issuer-form';
import 'animate.css/animate.min.css';

export class Issuer extends Component { 
    render() {
        return (
            <Grid.Column>
                <IssueForm mobile={this.props.mobile} />
            </Grid.Column>
        );
    }
}

