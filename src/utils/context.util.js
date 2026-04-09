import { AsyncLocalStorage } from 'async_hooks';

export const contextStorage = new AsyncLocalStorage();

export const getContext = () => contextStorage.getStore() || {};

export const setContext = (data, next) => {
    contextStorage.run(data, next);
};
