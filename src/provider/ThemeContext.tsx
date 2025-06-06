import { ConfigProvider, Empty } from "antd";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

const defaultTheme = {
  main: "#FFFFFF",
  primary: "#FFFFFF",
  secondary: "#EFF6FF",
  danger: "#D92D20",
  success: "#44AF42",
  successGreen: "#22C55E",
  darkGreen: "#15803D",
  warning: "#FAAD14",
  info: "#1890FF",
  lightBlue: "#C6E2F9",
  skyBlue: "#F0F9FF",
  lightGreen: "#D1FADF",
  lightMint: "#F3F4F6",
  lightGray: "#9CA3AF",
  mintGreen: "#DCFCE7",
  lightOrange: "#C2410C",
  mintOrange: "#FFF7ED",
  mintMist: "#ECFDF3",
  softPink: "#FEF3F2",
  peachBlush: "#FEE4E2",
  darkGray: "#2C2C2C",
  mediumGray: "#8A8A8A",
  darkestGray: "#1F1F1F",
  lightBlueGray: "#DBEAFE",
  primaryWithAlpha: "#005FAB14",
  paleSkyBlue: "#F9FCFF",
  sunflowerYellow: "#FDE047",
  sunsetEmber: "#FA7953",
  blushMist: "#FEF2F2",
  firestormRed: "#DC2626",
  skyFrost: "#E3F2FD",
  darkBlue: "#44546F",
};

interface ThemeContextProps {
  theme: typeof defaultTheme;
  setTheme: (theme: typeof defaultTheme) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: theme.primary,
            colorError: theme.danger,
            colorErrorHover: theme.danger,
          },
          components: {
            Layout: {
              colorBgHeader: "#fff",
            },
            Menu: {
              colorItemBg: "#fff",
              colorSubItemBg: "#fff",
            },
          },
        }}
        renderEmpty={() => <Empty />}
      >
        {children}
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
