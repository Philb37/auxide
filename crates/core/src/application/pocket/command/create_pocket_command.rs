/// Input of [`PocketUseCase::create`](crate::application::pocket::pocket_use_case::PocketUseCase::create):
/// the name as the user typed it, validated by the use case.
pub struct CreatePocketCommand {
    name: String,
}

impl CreatePocketCommand {
    /// Wraps the raw name. No validation here: the use case does it.
    pub fn new(name: String) -> Self {
        CreatePocketCommand { name }
    }

    /// The command's name.
    pub fn name(&self) -> &str {
        &self.name
    }

    /// Consumes the command and returns the raw name.
    pub fn into_name(self) -> String {
        self.name
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_should_create_command_with_name() {
        let name = "my_pocket".to_string();

        let result = CreatePocketCommand::new(name.clone());

        assert_eq!(result.name, name);
    }

    #[test]
    fn into_name_should_consume_command_and_return_the_name() {
        let name = "my_pocket".to_string();

        let create_pocket_command = CreatePocketCommand::new(name.clone());

        let result = create_pocket_command.into_name();

        assert_eq!(result, name);
    }
}
