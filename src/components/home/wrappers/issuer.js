import React, {Component} from 'react'
import { Issuer } from '../../issuer';
import { ThemeContext } from '../home';

export const IssuerComponent = (props) => {
    return (
        <ThemeContext.Consumer>
            {theme => <Issuer mobile={theme} />}
        </ThemeContext.Consumer>
    )
}

export class IssuerWrapper extends Component {
    render() {
        return <IssuerComponent />
    }
}