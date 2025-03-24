use leptos::prelude::*;

#[component]
pub fn GameTile(game: String, path: String, 
    #[prop(default = "".to_string())]
    image_url: String
) -> impl IntoView {
    view! {
        <div class="game-tile">
            <a href=path>
                <div
                    class="game-tile-image"
                    style=format!("background-image: url('nim/images/{}');", image_url)
                >
                    <span class="game-tile-text">{game}</span>
                </div>
            </a>
        </div>
    }
}

#[component]
pub fn GamePicker() -> impl IntoView {
    view! {
        <div>
            <h1>Nim Hub</h1>
            <ul>
                <GameTile
                    game="Nim".to_string()
                    path="/nim".to_string()
                    image_url="nim.png".to_string()
                />
                <GameTile
                    game="Marbles".to_string()
                    path="/marbles".to_string()
                    image_url="marbles.png".to_string()
                />
            </ul>
        </div>
    }
}
