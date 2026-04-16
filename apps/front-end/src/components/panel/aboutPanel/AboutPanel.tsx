import { MuiMarkdown } from "mui-markdown";
import Heading from "../heading/Heading";
import ContentPanel from "../contentPanel/ContentPanel";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getDatasetId } from "../../../utils/window-utils";

const AboutPanel = () => {
  const { t, i18n } = useTranslation();
  const [aboutMarkdownContent, setAboutMarkdownContent] = useState("");

  // Fetching the markdown to render in the about panel from the ui vocab
  // string t("about_content") - if this exists it overwrites the
  // non-localised about.md from the dataset.
  // This is a little messy to edit but means everything goes in config.json.
  // In future we might want to break this out into localised md files.
  const hasAboutContentInConfig = i18n.exists("about_content");

  useEffect(() => {
    if (!hasAboutContentInConfig) {
      fetch(`${import.meta.env.VITE_API_URL}/dataset/${getDatasetId()}/about`)
        .then((response) => response.text())
        .then((text) => {
          console.log("About content", text);
          setAboutMarkdownContent(text);
        });
    }
  });

  const content = hasAboutContentInConfig
    ? t("about_content")
    : aboutMarkdownContent;
  return (
    <>
      <Heading title={t("about")} />
      <ContentPanel>
        <MuiMarkdown>{content}</MuiMarkdown>
      </ContentPanel>
    </>
  );
};

export default AboutPanel;
