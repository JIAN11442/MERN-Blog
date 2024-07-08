import { create } from "zustand";

interface NavbarProps {
  panelCollapsed: boolean;
  searchBarVisibility: boolean;

  setPanelCollapsed: (panelCollapsed: boolean) => void;
  setSearchBarVisibility: (searchBarVisibility: boolean) => void;
}

const useNavbarStore = create<NavbarProps>((set) => ({
  panelCollapsed: false,
  searchBarVisibility: false,

  setPanelCollapsed: (panelCollapsed) => set({ panelCollapsed }),
  setSearchBarVisibility: (searchBarVisibility) => set({ searchBarVisibility }),
}));

export default useNavbarStore;
