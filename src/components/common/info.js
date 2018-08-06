import React from 'react';
import { Header, Modal, Button, Icon } from 'semantic-ui-react'
import { styles } from '../common-styles';

export const InfomaticModal = (props) => {
    return (
        <Modal trigger={props.trigger} closeIcon>
            <Modal.Header style={{display: 'flex'}}>
                <Icon name={props.iconName} style={{color: styles.buttonLight.color}} />
                <Header.Content style={styles.contentHeaderHome} content={props.header}/>
            </Modal.Header>
            <Modal.Content>
                <Header as='h3' style={styles.contentsubheader} content={props.content} />
            </Modal.Content>
        </Modal>
    );
}

export const PublicKeyInfo = (props) => {
    return (
        <InfomaticModal 
            iconName='key'
            header='Public Key'
            content={`A public key acts like a public address that is unique for each user. 
                It allows users to identify themselves without trusting third parties with the sensitive data we are used to 
                using such as social security number, government names, drivers license number etc`}
            trigger={<Button size='mini' style={{color: styles.buttonLight.color}} circular icon='question' />}
        />
    );
}

export const CredentialNameInfo = (props) => {
    return (
        <InfomaticModal 
            iconName='shield'
            header='Credential Name'
            content={'The name of the credential. Please be sure to check spelling and character spacing. Credential names are case sensitive'}
            trigger={<Button size='mini' style={{color: styles.buttonLight.color}} circular icon='question' />}
        />
    );
}

export const InstitutionIDInfo = (props) => {
    return (
        <InfomaticModal 
            iconName='university'
            header='Institution ID'
            content={`This is the identifier that uniquely identifies an issuer. 
                When a credential is issued it is associated with an issuer by their insitution id combined with other unique data.
                For demo purposes an institution id is provided for you (bf-edu-123), this means all credentials issued will be from our 
                BadgeForce University!`}
            trigger={<Button size='mini' style={{color: styles.buttonLight.color}} circular icon='question' />}
        />
    );
}