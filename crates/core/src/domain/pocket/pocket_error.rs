use thiserror::Error;

/// Why a pocket operation was refused.
#[derive(Error, Debug, PartialEq, Eq)]
pub enum PocketError {
    /// The name is empty or only whitespace.
    #[error("Pocket name cannot be empty.")]
    EmptyName,
}
