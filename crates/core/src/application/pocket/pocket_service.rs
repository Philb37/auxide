use crate::{
    application::pocket::{
        command::create_pocket_command::CreatePocketCommand, pocket_use_case::PocketUseCase,
    },
    domain::{
        id::id_generator::IdGenerator,
        pocket::{
            model::{Pocket, PocketName},
            pocket_error::PocketError,
            pocket_id::PocketId,
            pocket_repository::PocketRepository,
        },
    },
};

/// [`PocketUseCase`] implemented on top of an id generator and a pocket repository.
pub struct PocketService<IG: IdGenerator, PR: PocketRepository> {
    id_generator: IG,
    repository: PR,
}

impl<IG: IdGenerator, PR: PocketRepository> PocketService<IG, PR> {
    /// Wires the service to its ports.
    pub fn new(id_generator: IG, repository: PR) -> Self {
        Self {
            id_generator,
            repository,
        }
    }
}

impl<IG: IdGenerator, PR: PocketRepository> PocketUseCase for PocketService<IG, PR> {
    fn list(&self) -> Vec<Pocket> {
        self.repository.list()
    }

    fn create(&mut self, command: CreatePocketCommand) -> Result<Pocket, PocketError> {
        let pocket_name = PocketName::parse(command.name())?;

        let id = PocketId::from(self.id_generator.generate());

        let pocket = Pocket::new(id, pocket_name);

        self.repository.save(&pocket);

        Ok(pocket)
    }
}

#[cfg(test)]
mod tests {

    use uuid::Uuid;

    use crate::testing::{
        id_generator::deterministic_id_generator::DeterministicIdGenerator,
        repository::in_memory_pocket_repository::InMemoryPocketRepository,
    };

    use super::*;

    #[test]
    fn list_should_return_pockets() {
        let mut repository = InMemoryPocketRepository::default();
        let id_generator = DeterministicIdGenerator::default();

        let first_uuid = Uuid::from_u128(1);
        let second_uuid = Uuid::from_u128(2);

        let first_name = "my_first_pocket".to_string();
        let second_name = "my_second_pocket".to_string();

        let first_pocket = Pocket::new(first_uuid.into(), PocketName::parse(&first_name).unwrap());
        let second_pocket =
            Pocket::new(second_uuid.into(), PocketName::parse(&second_name).unwrap());

        repository.save(&first_pocket);
        repository.save(&second_pocket);

        let pocket_service = PocketService::new(id_generator, repository);

        let result = pocket_service.list();

        assert_eq!(result.len(), 2);
        assert!(
            result
                .iter()
                .any(|pocket| pocket.id() == first_uuid.into() && pocket.name() == first_name)
        );
        assert!(
            result
                .iter()
                .any(|pocket| pocket.id() == second_uuid.into() && pocket.name() == second_name)
        );
    }

    #[test]
    fn create_should_return_pocket() {
        let repository = InMemoryPocketRepository::default();

        let first_uuid = Uuid::from_u128(1);
        let second_uuid = Uuid::from_u128(2);

        let id_generator = DeterministicIdGenerator::default()
            .then_return(first_uuid)
            .then_return(second_uuid);

        let mut pocket_service = PocketService::new(id_generator, repository);

        let first_name = "my_first_pocket".to_string();
        let first_command = CreatePocketCommand::new(first_name.clone());

        let second_name = "my_second_pocket".to_string();
        let second_command = CreatePocketCommand::new(second_name.clone());

        let first_result = pocket_service.create(first_command);
        let second_result = pocket_service.create(second_command);

        let first_pocket = first_result.unwrap();
        let second_pocket = second_result.unwrap();

        assert_eq!(first_pocket.id(), first_uuid.into());
        assert_eq!(first_pocket.into_name(), first_name);
        assert_eq!(second_pocket.id(), second_uuid.into());
        assert_eq!(second_pocket.into_name(), second_name);
    }

    #[test]
    fn create_should_fail_if_name_is_blank() {
        let repository = InMemoryPocketRepository::default();
        let id_generator = DeterministicIdGenerator::default();

        let mut pocket_service = PocketService::new(id_generator, repository);

        let name = " ".to_string();
        let command = CreatePocketCommand::new(name.clone());

        let result = pocket_service.create(command);

        assert!(matches!(result, Err(PocketError::EmptyName)));
        assert!(pocket_service.list().is_empty());
    }

    #[test]
    fn create_then_list_should_return_created_pocket() {
        let repository = InMemoryPocketRepository::default();

        let uuid = Uuid::from_u128(1);

        let id_generator = DeterministicIdGenerator::default().then_return(uuid);

        let mut pocket_service = PocketService::new(id_generator, repository);

        let name = "my_first_pocket".to_string();
        let command = CreatePocketCommand::new(name.clone());

        let _ = pocket_service.create(command).unwrap();
        let result = pocket_service.list();

        assert_eq!(result.len(), 1);
        assert!(
            result
                .iter()
                .any(|pocket| pocket.id() == uuid.into() && pocket.name() == name)
        );
    }
}
