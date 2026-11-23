import { describe, expect, it } from 'vitest';
import { toApiError } from './to-api-error';

describe('toApiError', () => {
	it('keeps a known ApiError', () => {
		expect(toApiError({ code: 'pocketNameEmpty' })).toEqual({ code: 'pocketNameEmpty' });
	});

	it('turns an unknown value into internal by default', () => {
		expect(toApiError(new Error('boom'))).toEqual({ code: 'internal' });
		expect(toApiError({ code: 'notACode' })).toEqual({ code: 'internal' });
		expect(toApiError('internal')).toEqual({ code: 'internal' });
	});

	it('uses the given fallback for an unknown value', () => {
		expect(toApiError(new TypeError('Failed to fetch'), 'initError')).toEqual({ code: 'initError' });
	});

	it('keeps a known ApiError even when a fallback is given', () => {
		expect(toApiError({ code: 'internal' }, 'initError')).toEqual({ code: 'internal' });
	});
});
