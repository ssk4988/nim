mod components;
use components::Experiment;
use components::NimGame;

fn main() {
    console_error_panic_hook::set_once();
    leptos::mount::mount_to_body(NimGame)
}
