import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  isCreateKeyModalOpen: boolean;
  isCreateProjectModalOpen: boolean;
}

const initialState: UIState = {
  isCreateKeyModalOpen: false,
  isCreateProjectModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCreateKeyModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateKeyModalOpen = action.payload;
    },
    setCreateProjectModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreateProjectModalOpen = action.payload;
    },
  },
});

export const { setCreateKeyModalOpen, setCreateProjectModalOpen } = uiSlice.actions;
export default uiSlice.reducer;
