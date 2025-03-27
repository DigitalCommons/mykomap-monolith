import { useState, useEffect } from "react";
import Heading from "../heading/Heading";
import DirectoryItem from "./directoryItem/DirectoryItem";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "../../../app/hooks";
import { selectDirectoryOptions } from "./directorySlice";
import { getTotals } from "../../../services";
import { getDatasetId } from "../../../utils/window-utils";

const StyledDirectoryPanel = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  padding: "var(--spacing-medium) 0 80px",
  maxWidth: "var(--panel-width-desktop)",
  margin: "0 auto",
  "@media (min-width: 768px)": {
    padding: "var(--spacing-large) 0",
  },
}));

const fetchResults = async () => {
  const datasetId = getDatasetId();
  if (datasetId === null) {
    return { failed: true };
  }

  const response = await getTotals({ params: { datasetId } });

  return response.body;
};

const DirectoryPanel = () => {
  const { t } = useTranslation();

  const directoryOptions = useAppSelector(selectDirectoryOptions);
  const activeValue = directoryOptions.value;
  const [resultsTotals, setResultsTotals] = useState<any>();

  useEffect(() => {
    fetchResults().then((results: any) => {
      if (!results.failed) setResultsTotals(results);
    });
  }, []);

  return (
    <>
      <Heading title={t("directory")} />
      <StyledDirectoryPanel>
        <List>
          {directoryOptions.options.map((option, i) => (
            <DirectoryItem
              key={`${i}-${option.value}`}
              propId={directoryOptions.id}
              {...option}
              active={option.value === activeValue}
              resultsTotal={resultsTotals[option.value]}
            />
          ))}
        </List>
      </StyledDirectoryPanel>
    </>
  );
};

export default DirectoryPanel;
