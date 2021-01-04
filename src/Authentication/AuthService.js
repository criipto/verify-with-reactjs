import { UserManager, WebStorageStateStore } from "oidc-client";

export default class AuthService {
  UserManager;

  constructor(acr_values, popupWindowTarget) {
    this.UserManager = new UserManager({
      authority: process.env.REACT_APP_IDENTITY_CONFIG_AUTHORITY, // Your Criipto Domain eg. https://<YOUR_COMPANY>.criipto.id
      client_id: process.env.REACT_APP_IDENTITY_CONFIG_CLIENT_ID, // Your Criipto Client ID/Realm
      redirect_uri: process.env.REACT_APP_IDENTITY_CONFIG_REDIRECT_URI, // The Callback URI of your application where Criipto Verify will redirect to after the user has authenticated
      response_type: process.env.REACT_APP_IDENTITY_CONFIG_RESPONSE_TYPE, // The type of response desired from Criipto Verify
      loadUserInfo: true,
      post_logout_redirect_uri: process.env.REACT_APP_IDENTITY_CONFIG_POST_LOGOUT_REDIRECT_URI, // The Callback URI of your application where Criipto Verify will redirect to after the user has signed out
      acr_values: acr_values, // Specific authentication service to use eg. for login with Vipps app: urn:grn:authn:no:vipps
      userStore: new WebStorageStateStore({ store: window.sessionStorage }), // Storage object used to persist currently authenticated user
      // The following settings are optional and are required only if you'll be using those features
      popup_redirect_uri: process.env.REACT_APP_IDENTITY_CONFIG_POPUP_REDIRECT_URI, // The Callback URI of your application which handles the Popup callback
      popupWindowFeatures: process.env.REACT_APP_IDENTITY_CONFIG_POPUP_WINDOW_FEATURES, // Use this to customize a popup window
      popupWindowTarget: popupWindowTarget
    });

    this.UserManager.events.addUserLoaded(() => {
      window.top.dispatchEvent(new Event("LoginSuccess"));
    });
  }

  signinRedirect = () => {
    this.UserManager.signinRedirect();
  };

  signinPopup = () => {
    this.UserManager.signinPopup();
  };

  signinRedirectCallback = () => {
    this.UserManager.signinRedirectCallback()
    // do something after successful authentication
    .then(() => {
      window.location.replace("/");
    })
    // do something if there was an error
    .catch(() => {
      window.location.replace("/");
    });
  };

  signinPopupCallback = () => {
    this.UserManager.signinPopupCallback();
  };

  logout = () => {
    this.UserManager.signoutRedirect();
  };

  signoutRedirectCallback = () => {
    // UserManager will notify Criipto Verify about the logout
    this.UserManager.signoutRedirectCallback().then(() => {
      // Do something after the user logs out
      localStorage.clear();
      this.UserManager.clearStaleState();
      window.location.replace("/");
    });
  };

  isAuthenticated = () => {
    const oidcStorage = JSON.parse(
      sessionStorage.getItem(
        `oidc.user:${ process.env.REACT_APP_IDENTITY_CONFIG_AUTHORITY }:${ process.env.REACT_APP_IDENTITY_CONFIG_CLIENT_ID }`
        )
      );
    return (!!oidcStorage && !!oidcStorage.id_token);
  };
}