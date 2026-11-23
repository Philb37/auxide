use crate::domain::pocket::{pocket_error::PocketError, pocket_id::PocketId};

/// A pocket: a named place where spending and income are tracked.
#[derive(Debug, Clone)]
pub struct Pocket {
    id: PocketId,
    name: PocketName,
}

impl Pocket {
    /// Builds a pocket from an id and an already validated name.
    pub fn new(id: PocketId, pocket_name: PocketName) -> Self {
        Self {
            id,
            name: pocket_name,
        }
    }

    /// The pocket's id.
    pub fn id(&self) -> PocketId {
        self.id
    }

    /// The pocket's name, already trimmed and never empty.
    pub fn name(&self) -> &str {
        &self.name.value
    }

    /// Consumes the pocket and returns its name without copying it.
    pub fn into_name(self) -> String {
        self.name.value
    }
}

/// A valid pocket name: trimmed, never empty. Only [`PocketName::parse`] builds one, so a
/// `Pocket` cannot hold an invalid name.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PocketName {
    value: String,
}

impl PocketName {
    /// Trims `name` and checks it is not empty.
    ///
    /// # Errors
    ///
    /// [`PocketError::EmptyName`] if `name` is empty or only whitespace.
    pub fn parse(name: &str) -> Result<PocketName, PocketError> {
        let trimmed_name = name.trim();

        if trimmed_name.is_empty() {
            return Err(PocketError::EmptyName);
        }

        Ok(PocketName {
            value: trimmed_name.to_owned(),
        })
    }
}

#[cfg(test)]
mod tests {
    use uuid::Uuid;

    use super::*;

    #[test]
    fn new_should_create_pocket() {
        let pocket_id = Uuid::from_u128(1).into();
        let name = "my_pocket".to_string();
        let pocket_name = PocketName::parse(&name).unwrap();

        let result = Pocket::new(pocket_id, pocket_name);

        assert_eq!(result.id(), pocket_id);
        assert_eq!(result.into_name(), name);
    }

    #[test]
    fn parse_should_reject_whitespace_only_name() {
        let name = "  ".to_string();

        let result = PocketName::parse(&name);

        assert_eq!(result, Err(PocketError::EmptyName));
    }

    #[test]
    fn parse_should_trim_surrounding_spaces() {
        let name = "  my_pocket ".to_string();

        let result = PocketName::parse(&name);

        assert_eq!(result.unwrap().value, "my_pocket");
    }
}
