//! Auxide's domain: entities, use cases and the ports they need.
//!
//! Pure by design: no I/O, no framework, no infrastructure crate. Time, randomness and ids
//! come in through ports (`IdGenerator`), and storage through repository ports
//! (`PocketRepository`). Composition roots (`auxide-wasm`, `auxide-server`) pick the adapters.

/// Use cases: what a user can do, written against the domain and its ports.
pub mod application;
/// Entities, value objects, domain errors and the ports the use cases rely on.
pub mod domain;

// TODO(F0.2): once storage-opfs replaces the in-memory repository, drop
// `features = ["testing"]` from crates/wasm/Cargo.toml so no test double ships.
/// Test doubles for the ports (deterministic ids, in-memory repositories).
/// Built for core's own tests and behind the `testing` feature for other crates.
#[cfg(any(test, feature = "testing"))]
pub mod testing;
