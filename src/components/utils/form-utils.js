import React from 'react';
import { Message } from 'semantic-ui-react'

export const isValidForm = (predicates) => {
    const formErrors = predicates.filter(error => error !== null)
    .map(error => error);

    return {
        valid: formErrors.length === 0,
        errors: formErrors
    }
}

export const showFormErrors = (errors) => {
    return (
        <Message error
            header='Problems with your input'
            content={<Message.List items={errors.map((error, i) => {
                return <Message.Item key={i} content={error.message} />
            })} />}
        />
    )
}

export const showErrorMessage = (title, error) => {
    return (
        <Message error header={title} content={error.message} />
    );
}