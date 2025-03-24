use leptos::{logging, prelude::*};
use std::time::Duration;
use crate::{MarblesState, MarblesMove};


pub fn MarblesPlayer() -> impl IntoView {
    let (board, set_board) = signal(MarblesState::gen());
    let (picked_side, set_picked_side) = signal(false);
    let (sidebar_open, set_sidebar_open) = signal(false);
    

    let pile = move || {
        let pile_amt = board.get().pile_amt;
        let stones = (0..pile_amt).map(move |id| {
            let disabled = !board.get().turn || !picked_side.get();
            view! {
                <button
                    disabled=disabled
                    on:click=move |_| {
                        let id = (pile_amt - id).min(3);
                        set_board
                            .update(|board| {
                                board.apply_move(MarblesMove(id));
                            });
                    }
                    class="stone-button"
                    class=(
                        "no-hover",
                        move || {
                            let id = pile_amt - id;
                            disabled || id > 3
                        },
                    )
                />
            }
        }).collect_view();
        view! { <div class="pile">{stones}</div> }
    };

    let status_message = move || {
        if !picked_side.get() {
            "Would you like to move first or second?"
        }
        else if board.get().is_game_over() {
            if board.get().turn {
                "You lose!"
            } else {
                "You win!"
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
            <dialog
                class="sidebar"
                open=sidebar_open.get()
                style="width: 20rem; padding: 1rem; margin: 1rem; border: 1px solid black;"
            >
                <h2>Rules</h2>
                <p>
                    "On each turn, a player must pick 1-3 stones and remove them. The player who removes the last stone wins the game."
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
        let board_tmp = board.get();
        if board_tmp.is_game_over() || board_tmp.turn {
            return;
        }
        set_timeout(move || {
            // computer's turn
            let board_tmp = board.get();
            if board_tmp.is_game_over() || board_tmp.turn {
                return;
            }
            let computer_move = board_tmp.optimal_move();
            logging::log!("Game not over, computer moving with: ");
            logging::log!("{:?}", &computer_move);
            set_board.update(|board| {
                board.apply_move(computer_move);
            });
        }, Duration::from_secs(1));
    });

    // Effect to print out the board state and current grundy number
    Effect::new(move || {
        logging::log!("Board: {:?}", board.get().pile_amt);
        logging::log!("Grundy value: {}", board.get().grundy_value());
    });
    
    view! {
        <div class="container">
            <h1>Marbles</h1>
            <div class="menu">
                <button
                    class="help-button"
                    on:click=move |_| set_sidebar_open.update(|open| *open = !*open)
                >
                    <span class="material-icons">help_outline</span>
                </button>
                <button
                    class="help-button"
                    on:click=move |_| {
                        set_board.set(MarblesState::gen());
                        set_picked_side.set(false);
                    }
                >
                    <span class="material-icons">refresh</span>
                </button>
                <button
                    class="help-button"
                    disabled=move || board.get().moves.is_empty()
                    on:click=move |_| {
                        set_board
                            .update(|board| {
                                if board.turn {
                                    board.undo_move();
                                }
                                board.undo_move();
                            });
                    }
                >
                    <span class="material-icons">undo</span>
                </button>
            </div>
            <div class="status-message">
                {status_message}
                {move || { if picked_side.get() { None } else { Some(turn_prompt) } }}
            </div>
            <div class="marbles-container" class:opacity-0=move || !picked_side.get()>
                {pile}
            </div>
            {sidebar}
        </div>
    }
}
