import React, { Component } from 'react';
import { Container, Grid } from 'semantic-ui-react';
import { Tetris } from '../tetris/game';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = this.state = {
            hasError : false,
            error    : null,
            info     : null
        };
    }

    componentDidCatch(error, info) {
        this.setState({ 
            hasError : true, 
            error    : error,
            info     : info
        });
    }
    render() {
        if (this.state.hasError) {
            return (
                <Container fluid>
                    <Grid>
                        <Grid.Column>
                            <h1>Oops!!! Something went wrong :( , enjoy some tetris until things get fixed or refresh the page and try again</h1>
                            <Tetris />
                        </Grid.Column>
                    </Grid>
                </Container>
            );       
        } else {
            return this.props.children;
        }
    }
}

