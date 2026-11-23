use crate::domain::pocket::model::Pocket;

/// Port: where pockets are stored. Implemented by the storage adapters (in-memory for
/// now, SQLite in OPFS with F0.2).
pub trait PocketRepository {
    /// Every stored pocket. The order is not specified yet.
    fn list(&self) -> Vec<Pocket>;
    /// Inserts the pocket, or replaces the one with the same id.
    fn save(&mut self, pocket: &Pocket);
}
