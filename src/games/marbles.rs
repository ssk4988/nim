use rand::Rng;

#[derive(Debug, Clone)]
pub struct MarblesMove(pub u32 /* amount to remove */);

#[derive(Clone)]
pub struct MarblesState {
    pub pile_amt: u32, 
    pub turn: bool, // true if it's player's turn, false is computer's turn
    pub moves: Vec<MarblesMove> // store all moves made in the game
}

impl MarblesState {
    pub fn new(pile_amt: u32, turn: bool) -> Self {
        Self { pile_amt, turn, moves: Vec::new() }
    }

    pub fn gen() -> Self {
        let mut rng = rand::thread_rng();
        let pile_amt = rng.gen_range(10..=20);
        let turn = true;
        Self::new(pile_amt, turn)
    }

    pub fn is_game_over(&self) -> bool {
        self.pile_amt == 0
    }

    // note: refactor to return a Result
    pub fn apply_move(&mut self, action: MarblesMove) -> bool {
        let MarblesMove(amount) = action;
        if amount <= 0 || amount > 3 {
            return false;
        }
        if amount > self.pile_amt {
            return false;
        }
        self.pile_amt -= amount;
        self.turn = !self.turn;
        self.moves.push(action);
        true
    }

    pub fn grundy_value(&self) -> u32 {
        self.pile_amt % 4
    }

    pub fn optimal_move(&self) -> MarblesMove {
        let grundy = self.grundy_value();
        if grundy == 0 {
            // every move loses, pick an arbitrary move
            MarblesMove(1)
        } else {
            MarblesMove(grundy)
        }
    }

    pub fn undo_move(&mut self) {
        if let Some(MarblesMove(amount)) = self.moves.pop() {
            self.pile_amt += amount;
            self.turn = !self.turn;
        }
    }
}
