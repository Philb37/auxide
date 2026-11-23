use uuid::Uuid;

/// Identifies a pocket. A UUID generated on the client (through `IdGenerator`), so a
/// pocket created offline keeps its id when it syncs.
#[derive(Debug, Clone, Copy, Eq, Ord, PartialEq, PartialOrd, Hash)]
pub struct PocketId {
    value: Uuid,
}

impl PocketId {
    /// The underlying UUID, for adapters and DTOs.
    pub fn value(&self) -> Uuid {
        self.value
    }
}

impl From<Uuid> for PocketId {
    fn from(value: Uuid) -> Self {
        Self { value }
    }
}
