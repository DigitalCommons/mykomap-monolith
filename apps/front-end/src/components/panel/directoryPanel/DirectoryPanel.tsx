import Heading from "../heading/Heading";
import DirectoryItem from "./directoryItem/DirectoryItem";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useAppSelector } from "../../../app/hooks";
import { selectDirectoryOptions } from "./directorySlice";

interface DirectoryPanelProps {
  onClick?: (e: React.MouseEvent) => void; // for storybook testing
}

const StyledDirectoryPanel = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  padding: "var(--spacing-medium) 0",
  maxWidth: "var(--panel-width-desktop)",
  margin: "0 auto",
  "@media (min-width: 768px)": {
    padding: "var(--spacing-large) 0",
  },
}));

const DirectoryPanel = ({ onClick }: DirectoryPanelProps) => {
  const directoryOptions = useAppSelector(selectDirectoryOptions);
  const activeValue = directoryOptions.value;

  return (
    <>
      <Heading title="Directory" />
      <StyledDirectoryPanel>
        <List>
          {directoryOptions.options.map((option, i) => (
            <DirectoryItem
              key={`${i}-${option.value}`}
              propId={directoryOptions.id}
              {...option}
              active={option.value === activeValue}
            />
          ))}
        </List>
      </StyledDirectoryPanel>
    </>
  );
};

export default DirectoryPanel;
