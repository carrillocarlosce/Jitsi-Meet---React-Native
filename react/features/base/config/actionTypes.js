/**
 * The redux action which signals the configuration couldn't be loaded due to an
 * error.
 *
 * {
 *     type: LOAD_CONFIG_ERROR,
 *     error: Error
 * }
 */
export const LOAD_CONFIG_ERROR = Symbol('LOAD_CONFIG_ERROR');

/**
 * The redux action which sets the configuration represented by the feature
 * base/config. The configuration is defined and consumed by the library
 * lib-jitsi-meet but some of its properties are consumed by the application
 * jitsi-meet as well.
 *
 * {
 *     type: SET_CONFIG,
 *     config: Object
 * }
 */
export const SET_CONFIG = Symbol('SET_CONFIG');
