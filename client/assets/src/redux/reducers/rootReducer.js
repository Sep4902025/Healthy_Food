
import { combineReducers } from "redux";


import userReducer from "./userReducer";
import favoriteReducer from "./favoriteReducer";
import drawerReducer from "./drawerReducer";



const rootReducer = combineReducers({
  user: userReducer,
  favorite: favoriteReducer,
  drawer: drawerReducer,
});

export default rootReducer;
