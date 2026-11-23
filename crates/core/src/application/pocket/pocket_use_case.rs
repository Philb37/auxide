use crate::{
    application::pocket::command::create_pocket_command::CreatePocketCommand,
    domain::pocket::{model::Pocket, pocket_error::PocketError},
};

/// What a user can do with pockets.
pub trait PocketUseCase {
    /// Every pocket, in the order the repository returns them.
    fn list(&self) -> Vec<Pocket>;
    /// Creates and saves a pocket with a new id.
    ///
    /// # Errors
    ///
    /// [`PocketError::EmptyName`] if the name is empty or only whitespace; nothing is saved.
    fn create(&mut self, command: CreatePocketCommand) -> Result<Pocket, PocketError>;
}
