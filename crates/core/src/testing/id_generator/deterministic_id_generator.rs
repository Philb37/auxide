use std::{cell::RefCell, collections::VecDeque};

use uuid::Uuid;

use crate::domain::id::id_generator::IdGenerator;

/// [`IdGenerator`] that returns ids queued in advance, in the order they were queued.
#[derive(Default)]
pub struct DeterministicIdGenerator {
    deque: RefCell<VecDeque<Uuid>>,
}

impl DeterministicIdGenerator {
    /// Queues `uuid` as the next id returned after those already queued.
    pub fn then_return(self, uuid: Uuid) -> Self {
        self.deque.borrow_mut().push_front(uuid);
        self
    }
}

impl IdGenerator for DeterministicIdGenerator {
    /// # Panics
    ///
    /// If no id is left in the queue: the test forgot a `then_return`.
    fn generate(&self) -> Uuid {
        self.deque
            .borrow_mut()
            .pop_back()
            .expect("then_return must be called before calling generate.")
    }
}
