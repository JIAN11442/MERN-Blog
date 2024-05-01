import { create } from "zustand";

interface CollapseState {
  panelCollapsed: boolean;
  searchBarVisibility: boolean;

  setPanelCollapsed: (panelCollapsed: boolean) => void;
  setSearchBarVisibility: (searchBarVisibility: boolean) => void;
}

const useCollapseStore = create<CollapseState>((set) => ({
  panelCollapsed: false,
  searchBarVisibility: false,

  setPanelCollapsed: (panelCollapsed) => set({ panelCollapsed }),
  setSearchBarVisibility: (searchBarVisibility) => set({ searchBarVisibility }),
}));

export default useCollapseStore;
