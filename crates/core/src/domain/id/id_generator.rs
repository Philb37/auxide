use uuid::Uuid;

/// Port: the only way core gets new ids. Core never generates a UUID itself, so
/// tests can use fixed ids and the composition root picks the real generator.
pub trait IdGenerator {
    /// Returns a new id. Implementations must not repeat an id.
    fn generate(&self) -> Uuid;
}
