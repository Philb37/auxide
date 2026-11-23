use auxide_core::domain::pocket::pocket_error::PocketError;
use serde::Serialize;
use thiserror::Error;
use tsify::Tsify;
use wasm_bindgen::JsValue;

use crate::console_error;

/// Error thrown to JavaScript as `{ code: "…" }`. Only the code crosses the boundary: the
/// UI picks the copy. `web/src/lib/models/api-error.ts` mirrors this type and
/// `web/src/lib/api/to-api-error.ts` fails `pnpm check` if the two drift apart.
#[derive(Tsify, Serialize, Error, Debug)]
#[serde(rename_all = "camelCase", tag = "code")]
pub enum ApiError {
    /// The wasm or its storage could not start. Never built in Rust today: the TS side
    /// produces it when the Worker fails to load. It lives here so the generated union
    /// stays the single list of codes.
    #[error("Wasm initialization error")]
    InitError,
    /// Something that is not the user's fault. `message` stays in Rust (it is logged to
    /// the console, not sent), so the JS type is `{ code: "internal" }`.
    #[error("Internal error: {message}")]
    Internal {
        #[serde(skip)]
        message: String,
    },
    /// The pocket name is empty or only whitespace.
    #[error("Pocket name cannot be empty")]
    PocketNameEmpty,
}

impl From<PocketError> for ApiError {
    fn from(value: PocketError) -> Self {
        match value {
            PocketError::EmptyName => ApiError::PocketNameEmpty,
        }
    }
}

impl From<tsify::Error> for ApiError {
    fn from(error: tsify::Error) -> Self {
        ApiError::Internal {
            message: error.to_string(),
        }
    }
}

impl From<ApiError> for JsValue {
    fn from(value: ApiError) -> Self {
        if let ApiError::Internal { message } = &value {
            console_error(message);
        }

        serde_wasm_bindgen::to_value(&value)
            // Only reached if serde-wasm-bindgen itself fails. This is a JS string, not an
            // object: `toApiError` in web/src/lib/api turns any non-object into `internal`.
            .unwrap_or_else(|_| JsValue::from_str("{ code: 'internal' }"))
    }
}
