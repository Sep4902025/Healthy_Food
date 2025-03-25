
import { combineReducers } from "redux";

import userReducer from "./userReducer";
import favoriteReducer from "./favoriteReducer";


const rootReducer = combineReducers({
  user: userReducer,
  favorite: favoriteReducer,
});

export default rootReducer;

