import React from 'react';
import { connect } from 'react-redux';
import {signIn, signOut} from "../actions";


class GoogleAuth extends React.Component {

    componentDidMount() {
        // arg 1: What part of the gapi library we want to load
        // arg 2: Callback of what to do once the load has finished
        window.gapi.load('client:auth2', () => {
            window.gapi.client.init({
                // Given when you configure your console.developers.google.com console
                clientId: `${process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}`,
                // What info form the users do we want to get access to.
                scope: 'email'
            }).then(() => {
                // window.gapi.client.init returns a promise. We use `then` to get save a reference to the
                // auth instance in the component's state so that we can easily reference it later.
                // The authInstance contains many convenient methods like
                // - auth.signIn(): opens Google's authentication popup
                // - auth.isSignedIn.get(): true if the user is signed in
                // - auth.isSignedIn.listen(callback): a listener that is called when the isSignedIn status changes.
                //   The callback is called with a boolean that represents if the user is signed in
                this.auth = window.gapi.auth2.getAuthInstance();
                // Use action creators to update the redux store when the library finishes initialization
                this.onAuthChange(this.auth.isSignedIn.get());
                this.auth.isSignedIn.listen(this.onAuthChange);
            });
        });
    }

    // Needs to be arrow function to bind `this` since it will be used as a callback.
    onAuthChange = (isSignedIn) => {
        if (isSignedIn) {
            const userId = this.auth.currentUser.get().getId(); // Provides Google's userID
            this.props.signIn(userId);
        } else {
            this.props.signOut();
        }
    };

    // Callback function for when the user clicks sign in
    onSignInClick = () => {
      this.auth.signIn(); // Use wrapped-with-dispatch action creator
    };

    // Callback function for when the user clicks sign out
    onSignOutClick = () => {
      this.auth.signOut(); // Use wrapped-with-dispatch action creator
    };

    renderAuthButton() {
        if(this.props.isSignedIn === null) {
            return null; // A spinner could also work
        } else if (this.props.isSignedIn) {
            return (
                <button onClick={this.onSignOutClick} className="ui red google button">
                    <i className="google icon" />
                    Sign Out
                </button>
            );
        } else {
            return (
                <button onClick={this.onSignInClick} className="ui red google button">
                    <i className="google icon" />
                    Sign In with Google
                </button>
            );
        }
    }

    render() {
        return (
            <div>{this.renderAuthButton()}</div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return { isSignedIn: state.auth.isSignedIn };
};

export default connect(
    mapStateToProps,
    {signIn, signOut}
)(GoogleAuth);