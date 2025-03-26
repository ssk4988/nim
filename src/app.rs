use leptos::prelude::*;
use leptos_meta::{provide_meta_context, MetaTags, Stylesheet, Title};
use leptos_router::{
    components::{Route, Router, Routes},
    StaticSegment,
    path
};

mod components;
use components::{GamePicker, NimPlayer, MarblesPlayer};

// reexport so that the games can be used in the components
mod games;
pub use games::{NimMove, NimState, MarblesMove, MarblesState};

pub fn shell(options: LeptosOptions) -> impl IntoView {
    view! {
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <AutoReload options=options.clone() />
                <HydrationScripts options/>
                <MetaTags/>
            </head>
            <body>
                <App/>
            </body>
        </html>
    }
}

#[component]
pub fn App() -> impl IntoView {
    // Provides context that manages stylesheets, titles, meta tags, etc.
    provide_meta_context();

    view! {
        // injects a stylesheet into the document <head>
        // id=leptos means cargo-leptos will hot-reload this stylesheet
        <Stylesheet id="leptos" href="/pkg/nim.css"/>

        // add material icons
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"/>

        // sets the document title
        <Title text="Nim"/>

        // content for this welcome page
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

/// Renders the home page of your application.
#[component]
fn HomePage() -> impl IntoView {
    // Creates a reactive value to update the button
    let count = RwSignal::new(0);
    let on_click = move |_| *count.write() += 1;

    view! {
        <h1>"Welcome to Leptos!"</h1>
        <button on:click=on_click>"Click Me: " {count}</button>
    }
}
