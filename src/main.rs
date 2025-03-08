mod components;
use components::NimPlayer;
mod games;
pub use games::{NimState, NimMove};

fn main() {
    console_error_panic_hook::set_once();
    leptos::mount::mount_to_body(NimPlayer)
}
