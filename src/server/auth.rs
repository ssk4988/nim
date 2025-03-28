use std::sync::Arc;
use tokio::sync::{Mutex, MutexGuard};

use leptos::logging::log;

use oauth2::{
    basic::{BasicClient, BasicTokenType},
    AccessToken,
};
use oauth2::{reqwest::async_http_client, AuthorizationCode, CsrfToken};
use oauth2::{EmptyExtraTokenFields, Scope, StandardTokenResponse, TokenResponse};

use ::reqwest::Client;
use axum::{extract::Query, response::Redirect};

use serde::{Deserialize, Serialize};

// redirect to Google OAuth login page
pub async fn google_auth(oauth_client: Arc<Mutex<BasicClient>>) -> Redirect {
    let client: MutexGuard<BasicClient> = oauth_client.lock().await;
    let client: &BasicClient = &*client;
    // Generate the authorization URL
    let (auth_url, _csrf_token) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("openid".to_string()))
        .add_scope(Scope::new("email".to_string()))
        .add_scope(Scope::new("profile".to_string()))
        .add_extra_param("prompt", "select_account")
        .url();
    log!("Authorization URL: {}", auth_url);
    // Redirect the user to Google's OAuth 2.0 authorization page
    Redirect::temporary(auth_url.as_str())
}

// Callback route for Google OAuth after user logs in
pub async fn google_callback(
    oauth_client: Arc<Mutex<BasicClient>>,
    Query(params): Query<std::collections::HashMap<String, String>>,
) -> Redirect {
    let client = oauth_client.lock().await;

    // log the query parameters for now
    log!("Query parameters: {:?}", params);

    // Extract the authorization code from the query parameters
    if let Some(code) = params.get("code") {
        let token_result: Result<StandardTokenResponse<EmptyExtraTokenFields, BasicTokenType>, _> =
            client
                .exchange_code(AuthorizationCode::new(code.to_string()))
                .request_async(async_http_client)
                .await;

        let log_response = match token_result {
            Ok(token) => {
                log!("Access token: {:?}", token.access_token().secret());
                log!("Token response: {:?}", token);
                let access_token = token.access_token();
                let id_token = "Unknown ID token".to_string();
                // let id_token = token.id_token().unwrap_or("No ID token".to_string());
                google_get_user_info(access_token).await;
                format!(
                    "Authentication successful! ID Token: {} {:?}",
                    id_token, token
                )
            }
            Err(err) => format!("Failed to exchange token: {}", err),
        };
        log!("Response: {}", log_response);
        Redirect::to("/")
    } else {
        log!("No authorization code provided");
        // TODO: ROUTE DOESN'T EXIST
        Redirect::to("/error")
    }
}

// Struct to hold the user information returned by Google OAuth
#[derive(Debug, Serialize, Deserialize)]
pub struct GoogleUserInfo {
    sub: String,          // User's unique Google ID
    name: String,         // User's full name
    given_name: String,   // User's first name
    family_name: String,  // User's last name
    picture: String,      // URL to the user's profile picture
    email: String,        // User's email address
    email_verified: bool, // Whether the email is verified
}

// pull scope information from the access token given by Google OAuth
pub async fn google_get_user_info(access_token: &AccessToken) -> Option<GoogleUserInfo> {
    let http_client = Client::new();

    let response = http_client
        .get("https://www.googleapis.com/oauth2/v3/userinfo")
        .bearer_auth(access_token.secret()) // Add the access token as a Bearer token
        .send()
        .await;
    if let Err(err) = response {
        log!("Failed to get user info: {}", err);
        return None;
    }
    let response = response.unwrap();
    if response.status().is_success() {
        log!("User info response: {:?}", response);
        let user_info = response.json::<GoogleUserInfo>().await;
        if let Err(err) = user_info {
            log!("Failed to parse user info: {}", err);
            return None;
        }
        let user_info = user_info.unwrap();
        log!("User info: {:?}", user_info);
        Some(user_info)
    } else {
        None
    }
}
