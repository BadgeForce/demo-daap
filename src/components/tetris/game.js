import React, { Component } from 'react';
import { Grid, Header } from 'semantic-ui-react';
import { ThemeContext } from '../home/home';

const $ = window.jQuery;

export class Game extends Component {
    componentDidMount() {
        $('.game').blockrain();
        $('.game').blockrain('theme', 'candy');

        if(this.props.mobile) {
            $('.game').blockrain('touchControls', true);
        }
    }
    move = (key, direction) => {
        let code;
        switch (direction) {
            case 'left':
                code = 37;
                break;
            case 'up':
                code = 38;
                break;
            case 'right':
                code = 39;
                break;
            case 'down':
                code = 40;
                break;
            default:
                break;
        }

        document.getElementById(key).dispatchEvent(new KeyboardEvent("keypress", {keyCode: code}));
    }
    renderInstructions = () => {
        return (
            <Grid.Column width={4}>
                <div className="instructions">
                    <Header style={{fontWeight: 'bold', color: '#2f51bf'}} content='Use arrows to control blocks' />
                    {/* <div className="keyboard">
                    <div id='keyboard-up' className="key key-up" onClick={() => this.move('keyboard-up', 'up')}/>
                    <div id='keyboard-left' className="key key-left" onClick={() => this.move('keyboard-left', 'left')}/>
                    <div id='keyboard-down' className="key key-down" onClick={() => this.move('keyboard-down', 'down')}/>
                    <div id='keyboard-right' className="key key-right" onClick={() => this.move('keyboard-right', 'right')}/>
                    </div> */}
                </div>
            </Grid.Column>
        );
    }
    render() {
        return (
            <Grid columns={this.props.mobile ? 1 : 2} style={{justifyContent: 'center'}}>
                {!this.props.mobile ? this.renderInstructions(): null}
                <Grid.Column width={8}>
                    <div className="game" style={{width: '200px', height:'330px'}}></div>
                </Grid.Column>
            </Grid>
        );
    }
}

export const Tetris = (props) => {
    return (
        <ThemeContext.Consumer>
            {theme => <Game mobile={theme} />}
        </ThemeContext.Consumer>
    )
}
