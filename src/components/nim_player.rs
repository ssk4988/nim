use leptos::{logging, prelude::*};
use std::time::Duration;
use rand::Rng;
use crate::{NimState, NimMove};


pub fn NimPlayer() -> impl IntoView {
    let mut rng = rand::thread_rng();
    let num_piles = rng.gen_range(3..=5);
    let original_piles = (0..num_piles).map(|_| rng.gen_range(1..=6)).collect::<Vec<_>>();
    let (board, set_board) = signal(NimState::new(original_piles.clone(), true));
    let (picked_side, set_picked_side) = signal(false);
    let (sidebar_open, set_sidebar_open) = signal(false);
    let pile_stones = move || {
        board
            .get()
            .piles
            .iter()
            .enumerate()
            .map(|(id, &pile)| {
                let stones = (1..=pile).map(move |index| {
                    view! {
                        <button
                            disabled=move || !board.get().turn || !picked_side.get()
                            on:click=move |_| {
                                set_board
                                    .update(|board| {
                                        board.apply_move(NimMove(id, pile + 1 - index));
                                    });
                            }
                            class="stone-button"
                        />
                    }
                }).collect_view();
                view! { <div class=("pile-column", move || pile > 0)>{stones}</div> }
            })
            .collect_view()
    };

    let status_message = move || {
        if !picked_side.get() {
            "Would you like to move first or second?"
        }
        else if board.get().is_game_over() {
            if board.get().turn {
                "Computer wins!"
            } else {
                "Player wins!"
            }
        } else {
            if board.get().turn {
                "It's your turn!"
            } else {
                "Computer is thinking..."
            }
        }
    };

    let sidebar = move || {
        view! {
            <dialog class="sidebar" open=sidebar_open.get()
                style="width: 20rem; padding: 1rem; margin: 1rem; border: 1px solid black;">
                <h2>Rules</h2>
                <p>
                    "Nim is a mathematical game of strategy in which two players take turns removing stones from piles. On each turn, a player must pick a pile and remove at least one stone from it. The goal of the game is to be the player who removes the last stone."
                </p>
                <h2>How to Play</h2>
                <p>
                    "To play, select a pile and remove any number of stones from it. The player who removes the last stone wins the game."
                </p>
                <p>
                    "For more information, visit "
                    <a href="https://brilliant.org/wiki/nim/" target="_
                    blank">"Brilliant's Article on Nim"</a>
                </p>
            </dialog>
        }
    };

    let turn_prompt = move || view! {
        <div style="display: flex; justify-content: center; margin-top: 1rem;">
            <button
                on:click=move |_| {
                    set_picked_side.set(true);
                }
                class="turn-button"
            >
                "First"
            </button>
            <button
                on:click=move |_| {
                    set_picked_side.set(true);
                    set_board
                        .update(|board| {
                            board.turn = false;
                        });
                }
                class="turn-button"
            >
                "Second"
            </button>
        </div>
    };

    // Effect to make computer move
    Effect::new(move || {
        let board = board.get();
        if board.is_game_over() || board.turn {
            return;
        }
        set_timeout(move || {
            // computer's turn
            let computer_move = board.computer_move();
            logging::log!("Game not over, computer moving with: ");
            logging::log!("{:?}", &computer_move);
            set_board.update(|board| {
                board.apply_move(computer_move);
            });
        }, Duration::from_secs(1));
    });

    // Effect to print out the board state and current grundy number
    Effect::new(move || {
        logging::log!("Board: {:?}", board.get().piles);
        logging::log!("Grundy value: {}", board.get().grundy_value());
    });
    
    view! {
        <div class="container">
            <h1>Nim</h1>
            <button class="help-button" on:click=move |_| set_sidebar_open.update(|open| *open = !*open)>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2zm0 4h2v6h-2z"/>
        </svg>
            </button>
            <div class="status-message">
                {status_message}
                {move || { if picked_side.get() { None } else { Some(turn_prompt) } }}
            </div>
            <div class="nim-container" class:opacity-0=move || !picked_side.get()>
                {pile_stones}
            </div>
            {sidebar}
        </div>
    }
}
