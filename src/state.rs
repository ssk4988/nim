use oauth2::basic::BasicClient;
use std::sync::Arc;
use tokio::sync::Mutex;
use sqlx::Pool;
use sqlx::Postgres;

#[derive(Clone)]
pub struct AppState {
    pub oauth_client: Arc<Mutex<BasicClient>>,
    pub db_pool: Pool<Postgres>,
}
