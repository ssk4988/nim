use leptos::{logging, prelude::*};
use std::{vec, time::Duration};
use rand::Rng;
use crate::{NimState, NimMove};


pub fn NimPlayer() -> impl IntoView {
    let mut rng = rand::thread_rng();
    let num_piles = rng.gen_range(3..=5);
    let original_piles = (0..num_piles).map(|_| rng.gen_range(1..=6)).collect::<Vec<_>>();
    let (board, set_board) = signal(NimState::new(original_piles.clone(), true));
    let (picked_side, set_picked_side) = signal(false);
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
                view! { <div>{stones}</div> }
            })
            .collect_view()
    };

    let status_message = move || {
        if board.get().is_game_over() {
            if board.get().turn {
                "Computer wins!"
            } else {
                "Player wins!"
            }
            .to_owned()
        } else {
            "Turn: ".to_owned()
                + if board.get().turn {
                    "Player"
                } else {
                    "Computer"
                }
        }
    };

    let turn_prompt = move || view! {
        <p>"Would you like to move first or second?"</p>
        <button on:click=move |_| {
            set_picked_side.set(true);
        }>"First"</button>
        <button on:click=move |_| {
            set_picked_side.set(true);
            set_board
                .update(|board| {
                    board.turn = false;
                });
        }>"Second"</button>
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
        <div style="background-color: var(--background-color)">
            {status_message} {
                move || { if picked_side.get() { None } else { Some(turn_prompt) } }}
            <div class="nim-container" class:opacity-0=move || !picked_side.get()>
                {pile_stones}
            </div>
        </div>
    }
}
