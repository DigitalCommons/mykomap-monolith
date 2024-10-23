import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { userEvent, within } from "@storybook/test";
import NavBar from "./navBar";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../theme/theme";
import GlobalCSSVariables from "../../../theme/GlobalCSSVariables";
import { store } from "../../../app/store";
import { Provider } from "react-redux";

const meta = {
  title: "Components/Panel/NavBar",
  component: NavBar,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <GlobalCSSVariables />
          <Story />
        </ThemeProvider>
      </Provider>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    onTabChange: { action: "tabChanged" },
  },
} as Meta<typeof NavBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NavBarStory: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Click the first tab (Directory)
    const directoryTab = await canvas.getByRole("tab", { name: /Directory/i });
    await userEvent.click(directoryTab);
    if (args.onTabChange) {
      await args.onTabChange(0);
    }

    // Click the second tab (Search)
    const searchTab = await canvas.getByRole("tab", { name: /Search/i });
    await userEvent.click(searchTab);
    if (args.onTabChange) {
      await args.onTabChange(1);
    }

    // Click the third tab (About)
    const aboutTab = await canvas.getByRole("tab", { name: /About/i });
    await userEvent.click(aboutTab);
    if (args.onTabChange) {
      await args.onTabChange(2);
    }
  },
};
