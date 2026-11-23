use auxide_core::domain::id::id_generator::IdGenerator;
use uuid::Uuid;

/// Real [`IdGenerator`]: UUIDv7, time-ordered, created on the client so records made
/// offline keep their id when they sync. Lives here, not in core, because generating
/// needs the clock and randomness.
pub struct UuidGenerator;

impl IdGenerator for UuidGenerator {
    fn generate(&self) -> Uuid {
        Uuid::now_v7()
    }
}
