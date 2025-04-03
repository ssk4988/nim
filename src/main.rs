use axum::{routing::get, Router};
use oauth2::{basic::BasicClient, AuthUrl, ClientId, ClientSecret, RedirectUrl, TokenUrl};

use leptos::logging::log;
use std::sync::Arc;
use tokio::sync::Mutex;
use sqlx::postgres::PgPoolOptions;
use dotenv::dotenv;
use std::env;

mod server;
use server::{google_auth, google_callback, add_random_user};

mod state;
use state::AppState;


#[cfg(feature = "ssr")]
#[tokio::main]
async fn main() {
    use dotenv::from_filename;
    use leptos::logging::log;
    use leptos::prelude::*;
    use leptos_axum::{generate_route_list, LeptosRoutes};
    use nim::app::*;
    use std::env;

    // Load the .env file
    from_filename(".env.dev").ok();

    let conf = get_configuration(None).unwrap();
    let addr = conf.leptos_options.site_addr;
    let leptos_options = conf.leptos_options;
    // Generate the list of routes in your Leptos App
    let routes = generate_route_list(App);

    // Create the OAuth2 client
    let google_client_id = env::var("GOOGLE_CLIENT_ID").expect("GOOGLE_CLIENT_ID must be set");
    let google_client_secret =
        env::var("GOOGLE_CLIENT_SECRET").expect("GOOGLE_CLIENT_SECRET must be set");
    let google_redirect_uri =
        env::var("GOOGLE_REDIRECT_URI").expect("GOOGLE_REDIRECT_URI must be set");
    let oauth_client = Arc::new(Mutex::new(
        BasicClient::new(
            ClientId::new(google_client_id),
            Some(ClientSecret::new(google_client_secret)),
            AuthUrl::new("https://accounts.google.com/o/oauth2/auth".to_string()).unwrap(),
            Some(TokenUrl::new("https://oauth2.googleapis.com/token".to_string()).unwrap()),
        )
        .set_redirect_uri(
            RedirectUrl::new(google_redirect_uri).unwrap(),
        ),
    ));

    // Initialize database connection and connection pool
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let db_pool = PgPoolOptions::new()
        .max_connections(5) // Set the maximum number of connections
        .connect(&database_url)
        .await
        .expect("Failed to create database connection pool");

    let app_state = AppState {
        oauth_client: oauth_client.clone(),
        db_pool: db_pool,
    };
    // Create a single HTTP client instance
    // let http_client = Arc::new(Client::new());

    let app = Router::new()
        .leptos_routes(&leptos_options, routes, {
            let leptos_options = leptos_options.clone();
            move || shell(leptos_options.clone())
        })
        .route(
            "/auth/google",
            get({
                let oauth_client = oauth_client.clone();
                move || google_auth(oauth_client)
            }),
        )
        .route(
            "/auth/google/callback",
            get({
                let oauth_client = oauth_client.clone();
                move |query| google_callback(oauth_client, query)
            }),
        )
        // .route(
        //     "/add_random_user",
        //     get(add_random_user),
        // )
        .fallback(leptos_axum::file_and_error_handler(shell))
        .with_state((leptos_options, app_state));

    // run our app with hyper
    // `axum::Server` is a re-export of `hyper::Server`
    log!("listening on http://{}", &addr);
    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();
}

#[cfg(not(feature = "ssr"))]
pub fn main() {
    // no client-side main function
    // unless we want this to work with e.g., Trunk for pure client-side testing
    // see lib.rs for hydration function instead
}
