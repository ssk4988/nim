use leptos::prelude::*;

#[component]
fn ProgressBar(
    /// The maximum value of the progress bar
    #[prop(default=100)] 
    max: u32, 
    /// The current progress of the bar
    #[prop(into)] 
    progress: Signal<u32>
) -> impl IntoView {
    view! {
        <progress
            max=max
            value=progress
        />
        <br/>
    }
}

#[component]
pub fn Experiment() -> impl IntoView {
    let (count, set_count) = signal(0u32);
    let triple = move || count.get() * 3;

    view! {
        <button
            on:click=move |_| *set_count.write() += 1
            class:red=move || count.get() % 2 == 0
            style=("--columns", move || (count.get()*10+10).to_string())
            style:margin-left="var(--columns)"
        >
            "Clicks: " {count}
        </button>
        <ProgressBar progress=count max=50/>
        <ProgressBar progress=Signal::derive(triple) />
        <p>
            "React long: " {move || count.get()}
        </p>
        <p> "React short: " {count} </p>
        <p> "Nonreactive: " {count.get()} </p>
    }
}
