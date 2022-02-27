import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { RootReducer } from './redux/reducers/RootReducer';
import thunk from 'redux-thunk';
import { useDispatch } from 'react-redux';
import { setupEventsHub } from './signalR/socketMiddleware';

export const store = configureStore({
  reducer: RootReducer,
  middleware: [thunk],
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
