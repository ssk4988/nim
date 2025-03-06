use std::vec;

use leptos::prelude::*;

struct NimMove(usize /* pile */, u32 /* amount */);

#[derive(Clone)]
struct NimState {
    piles: Vec<RwSignal<u32>>,
    turn: bool, // true if it's player's turn, false is computer's turn
}

impl NimState {
    fn new(piles: Vec<u32>, turn: bool) -> Self {
        Self { piles: piles.into_iter().map(|pile| RwSignal::new(pile)).collect::<Vec<_>>(), turn }
    }

    fn is_game_over(&self) -> bool {
        self.piles.iter().all(|&pile| pile.get() == 0)
    }

    // note: refactor to return a Result
    fn apply_move(&mut self, action: NimMove) -> bool {
        let NimMove(pile, amount) = action;
        if pile >= self.piles.len() {
            return false;
        }
        let pile_amt = self.piles[pile].get();
        if pile_amt < amount {
            return false;
        }
        if pile_amt == 0 {
            return false;
        }
        self.piles[pile].update(|amt| *amt -= amount);
        self.turn = !self.turn;
        true
    }

    fn grundy_value(&self) -> u32 {
        self.piles.iter().fold(0, |acc, pile| acc ^ pile.get())
    }
}


pub fn NimGame() -> impl IntoView {
    let original_piles = vec![3, 4, 5];
    let (board, set_board) = signal(NimState::new(original_piles.clone(), true));
    let pile_stones = move || board.get().piles.iter().enumerate().map(|(id, pile_signal)| {
        view!{
            <button
                on:click=move|_| {
                    set_board.update(|mut board| {
                        board.apply_move(NimMove(id, 1));
                    });
                }
            > "Do something" </button>
            <p> {pile_signal.get()} </p>
        }
    }).collect_view();
    view! {
        <p> "Grundy value: " {move || board.get().grundy_value()} </p>
        <p> "Board: " {move || format!("{:?}", board.get().piles.iter().map(|pile| pile.get()).collect::<Vec<_>>())} </p>
        
        <Show
            when=move || !board.get().is_game_over()
            fallback=move || "Game over!"
            >
            <button
                on:click=move|_| {
                    let first_pile = board.get().piles.iter().position(|&pile| pile.get() > 0).unwrap();
                    set_board.update(|mut board| {
                        board.apply_move(NimMove(first_pile, 1));
                    });
                }
            > "Do something" </button>
        </Show>
        {pile_stones}
    }
}
