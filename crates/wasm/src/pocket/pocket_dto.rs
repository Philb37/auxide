use auxide_core::domain::pocket::model::Pocket;
use serde::Serialize;
use tsify::Tsify;
use uuid::Uuid;

/// A pocket as JavaScript sees it: `{ id: string; name: string }`. Mirrored by
/// `web/src/lib/models/pocket.ts`.
#[derive(Tsify, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PocketDto {
    /// The UUID, serialized as a hyphenated string.
    #[tsify(type = "string")]
    id: Uuid,
    name: String,
}

impl From<Pocket> for PocketDto {
    fn from(value: Pocket) -> Self {
        PocketDto {
            id: value.id().value(),
            name: value.into_name(),
        }
    }
}
