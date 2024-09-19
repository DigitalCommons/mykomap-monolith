import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { screen, userEvent, within } from "@storybook/test";
import SelectBox from "./SelectBox";
import type { SelectChangeEvent } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../../theme/theme";
import GlobalCSSVariables from "../../../theme/GlobalCSSVariables";

// Simulate interaction with Material UI's Select component
const selectInteraction = async (canvasElement: HTMLElement) => {
  const canvas = within(canvasElement);

  // Find the currently selected option by its visible text
  const select = await canvas.getByText("Option 1"); // Default option visible

  // Click to open the dropdown
  await userEvent.click(select);

  // Find the dropdown list
  const selectOption = within(await screen.getByRole("listbox"));

  // Now find and click the option you want to select
  const option = selectOption.getByText("Option 2");
  await userEvent.click(option);
};

const meta: Meta<typeof SelectBox> = {
  title: "Common/SelectBox",
  component: SelectBox,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <GlobalCSSVariables />
        <Story />
      </ThemeProvider>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    onChange: { action: "changed" }, // Log changes in Storybook's action panel
  },
};

export default meta;
type Story = StoryObj<typeof SelectBox>;

export const Single: Story = {
  render: (args) => {
    const [selectedValue, setSelectedValue] = useState(args.value);

    const handleChange = (event: SelectChangeEvent<string>) => {
      setSelectedValue(event.target.value);
      args.onChange(event, null); // Pass the event up to Storybook action with null as the child
    };

    return (
      <SelectBox
        {...args}
        value={selectedValue} // Use the local state
        onChange={handleChange} // Handle the change and update local state
      />
    );
  },
  args: {
    label: "Countries",
    value: "Argentina", // Initial value
    options: [
      { label: "Argentina", value: "Argentina" },
      { label: "Armenia", value: "Armenia" },
      { label: "Australia", value: "Australia" },
    ],
  },
  play: ({ canvasElement }) => selectInteraction(canvasElement),
};
