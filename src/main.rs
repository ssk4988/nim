mod components;
use components::{GamePicker, NimPlayer, MarblesPlayer};

// reexport so that the games can be used in the components
mod games;
pub use games::{NimMove, NimState, MarblesMove, MarblesState};

use leptos::prelude::*;
use leptos_router::path;
use leptos_router::components::*;

#[component]
pub fn App() -> impl IntoView {
    view! {
        <Router>
            <nav></nav>
            <main>
                <Routes fallback=|| view! { <h1>404 Not Found</h1> }>
                    <Route path=path!("/") view=GamePicker />
                    <Route path=path!("/nim") view=NimPlayer />
                    <Route path=path!("/marbles") view=MarblesPlayer />
                </Routes>
            </main>
        </Router>
    }
}

fn main() {
    console_error_panic_hook::set_once();
    leptos::mount::mount_to_body(App)
}
