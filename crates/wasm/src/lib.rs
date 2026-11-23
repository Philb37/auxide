//! Composition root of the client: wires `auxide-core` to its adapters and exports it to
//! JavaScript with `wasm-bindgen`. No domain logic here: methods map types and forward
//! calls. Only `web/src/lib/api` (the `AuxideApi` facade, in a Web Worker) imports it.

use auxide_core::{
    application::pocket::{
        command::create_pocket_command::CreatePocketCommand, pocket_service::PocketService,
        pocket_use_case::PocketUseCase,
    },
    testing::repository::in_memory_pocket_repository::InMemoryPocketRepository,
};
use tsify::{Ts, Tsify};
use wasm_bindgen::prelude::*;

use crate::{
    error::api_error::ApiError, id::id_generator::UuidGenerator, pocket::pocket_dto::PocketDto,
};

mod error;
mod pocket;

mod id;

#[wasm_bindgen]
extern "C" {
    /// `console.error`, so failures that never cross the boundary (an internal error's
    /// message) still leave a trace in the Worker's console.
    #[wasm_bindgen(js_namespace = console, js_name = error)]
    fn console_error(s: &str);
}

/// The app's entry point in wasm: one instance per Worker, holding the wired use cases.
#[wasm_bindgen]
pub struct Auxide {
    pocket_use_case: Box<dyn PocketUseCase>,
}

#[wasm_bindgen]
impl Auxide {
    /// Wires the use cases to their adapters and returns the instance.
    ///
    /// Uses the in-memory repository for now, so data is lost when the Worker stops
    /// (SQLite in OPFS comes with F0.2).
    pub async fn open() -> Result<Auxide, ApiError> {
        Ok(Auxide {
            pocket_use_case: Box::new(PocketService::new(
                UuidGenerator,
                InMemoryPocketRepository::default(),
            )),
        })
    }

    /// Every pocket.
    #[wasm_bindgen(js_name = listPockets)]
    pub fn list_pockets(&self) -> Result<Vec<Ts<PocketDto>>, ApiError> {
        Ok(self
            .pocket_use_case
            .list()
            .into_iter()
            .map(PocketDto::from)
            .map(|pocket_dto| pocket_dto.into_ts())
            .collect::<Result<Vec<_>, _>>()?)
    }

    /// Creates a pocket from the name as typed (core trims and validates it).
    ///
    /// Throws `{ code: "pocketNameEmpty" }` if the name is empty or only whitespace.
    #[wasm_bindgen(js_name = createPocket)]
    pub fn create_pocket(&mut self, name: String) -> Result<Ts<PocketDto>, ApiError> {
        let pocket = self
            .pocket_use_case
            .create(CreatePocketCommand::new(name))?;

        Ok(PocketDto::from(pocket).into_ts()?)
    }
}
