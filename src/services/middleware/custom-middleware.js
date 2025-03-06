export const customMiddleware = () => {
    return (store) => {
        return (next) => (action) => {
            if (typeof action === "function") {
                // (dispatch) => {
                //     console.log(`add ${text}`);
                //     dispatch(addTask(text));
                // }


                return action(store.dispatch, store.getState);
            }

            return next(action);
        }
    }
}