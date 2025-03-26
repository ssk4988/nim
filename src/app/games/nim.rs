use rand::Rng;

#[derive(Debug, Clone)]
pub struct NimMove(pub usize /* pile */, pub u32 /* amount */);

#[derive(Clone)]
pub struct NimState {
    pub piles: Vec<u32>,
    pub turn: bool, // true if it's player's turn, false is computer's turn
    pub moves: Vec<NimMove> // store all moves made in the game
}

impl NimState {
    pub fn new(piles: Vec<u32>, turn: bool) -> Self {
        Self { piles, turn, moves: Vec::new() }
    }

    pub fn gen() -> Self {
        let mut rng = rand::thread_rng();
        let num_piles = rng.gen_range(3..=5);
        let piles = (0..num_piles).map(|_| rng.gen_range(1..=6)).collect();
        let turn = true;
        Self::new(piles, turn)
    }

    pub fn is_game_over(&self) -> bool {
        self.piles.iter().all(|&pile| pile == 0)
    }

    // note: refactor to return a Result
    pub fn apply_move(&mut self, action: NimMove) -> bool {
        let NimMove(pile, amount) = action;
        if pile >= self.piles.len() {
            return false;
        }
        let pile_amt = self.piles[pile];
        if pile_amt < amount {
            return false;
        }
        if pile_amt == 0 {
            return false;
        }
        self.piles[pile] -= amount;
        self.turn = !self.turn;
        self.moves.push(action);
        true
    }

    pub fn grundy_value(&self) -> u32 {
        self.piles.iter().fold(0, |acc, pile| acc ^ pile)
    }

    pub fn optimal_move(&self) -> NimMove {
        let grundy = self.grundy_value();
        if grundy == 0 {
            // every move loses, pick an arbitrary move
            let pile = (0..self.piles.len())
                .find(|&pile| self.piles[pile] > 0)
                .unwrap();
            let amount = 1;
            return NimMove(pile, amount);
        }
        for (idx, &pile_amt) in self.piles.iter().enumerate() {
            if pile_amt == 0 {
                continue;
            }
            let new_pile_amt = pile_amt ^ grundy;
            if new_pile_amt < pile_amt {
                return NimMove(idx, pile_amt - new_pile_amt);
            }
        }
        unreachable!();
    }

    pub fn undo_move(&mut self) {
        if let Some(NimMove(pile, amount)) = self.moves.pop() {
            self.piles[pile] += amount;
            self.turn = !self.turn;
        }
    }
}
