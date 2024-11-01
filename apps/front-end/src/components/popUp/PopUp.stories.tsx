import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme/theme";
import GlobalCSSVariables from "../../theme/GlobalCSSVariables";
import { CssBaseline } from "@mui/material";
import { store } from "../../app/store";
import { Provider } from "react-redux";
import PopUp from "./PopUp";
import { togglePopUp } from "./popUpSlice";

const meta = {
  title: "Common/PopUp",
  component: PopUp,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <GlobalCSSVariables />
          <CssBaseline />
          <Story />
        </ThemeProvider>
      </Provider>
    ),
  ],
  tags: ["autodocs"],
} as Meta<typeof PopUp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: () => {
    store.dispatch(togglePopUp());
  },
};
