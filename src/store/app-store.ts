import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

export const useAppStore = create(
  devtools(
    combine(
      {
        theme: 'light',
        language: 'zh-CN',
        sidebarCollapsed: false,
      },
      set => ({
        setTheme: (theme: string) => set({ theme }),
        toggleSidebar: () =>
          set(state => ({
            sidebarCollapsed: !state.sidebarCollapsed,
          })),
        setLanguage: (language: string) => set({ language }),
      })
    ),
    {
      name: 'app-store', // devtools 中显示的名称
    }
  )
);
