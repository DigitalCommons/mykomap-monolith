import { MuiMarkdown } from "mui-markdown";
import Heading from "../heading/Heading";
import ContentPanel from "../contentPanel/ContentPanel";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getDatasetId } from "../../../utils/window-utils";

const AboutPanel = () => {
  const { t } = useTranslation();
  const [aboutContent, setAboutContent] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/dataset/${getDatasetId()}/about`)
      .then((response) => response.text())
      .then((text) => {
        console.log("About content", text);
        setAboutContent(text);
      });
  });

  return (
    <>
      <Heading title={t("about")} />
      <ContentPanel>
        <MuiMarkdown>{aboutContent}</MuiMarkdown>
      </ContentPanel>
    </>
  );
};

export default AboutPanel;
