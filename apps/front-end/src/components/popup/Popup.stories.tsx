import type { Meta, StoryObj } from "@storybook/react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../theme/theme";
import GlobalCSSVariables from "../../theme/GlobalCSSVariables";
import { CssBaseline } from "@mui/material";
import { store } from "../../app/store";
import { Provider } from "react-redux";
import Popup from "./Popup";
// import { togglePopup } from "./popupSlice";

const meta = {
  title: "Common/Popup",
  component: Popup,
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
} as Meta<typeof Popup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: () => {
    // TODO: feed in mock item data
    // https://storybook.js.org/tutorials/intro-to-storybook/react/en/data/
    // store.dispatch(togglePopup());
  },
};
