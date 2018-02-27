// @flow

import { ReducerRegistry } from '../redux';
import { PersistenceRegistry } from '../storage';

import { PROFILE_UPDATED } from './actionTypes';

const STORE_NAME = 'features/base/profile';

/**
 * Sets up the persistence of the feature base/profile.
 */
PersistenceRegistry.register(STORE_NAME);

ReducerRegistry.register(
    STORE_NAME, (state = {}, action) => {
        switch (action.type) {
        case PROFILE_UPDATED:
            return action.profile;
        }

        return state;
    });
