use std::collections::HashMap;

use crate::domain::pocket::{
    model::Pocket, pocket_id::PocketId, pocket_repository::PocketRepository,
};

/// [`PocketRepository`] backed by a map, for tests. Also wired by `auxide-wasm` until the
/// OPFS adapter lands (F0.2).
#[derive(Default)]
pub struct InMemoryPocketRepository {
    pockets: HashMap<PocketId, Pocket>,
}

impl PocketRepository for InMemoryPocketRepository {
    fn list(&self) -> Vec<Pocket> {
        self.pockets.values().cloned().collect()
    }

    fn save(&mut self, pocket: &Pocket) {
        self.pockets.insert(pocket.id(), pocket.clone());
    }
}
