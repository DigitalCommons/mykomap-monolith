import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import Heading from "../heading/Heading";
import ContentPanel from "../contentPanel/ContentPanel";
import { useTranslation } from "react-i18next";

// Mock data
const aboutContent = `
  Ackroydon East TMO was established in 1997 and has been delivering housing management, maintenance and estate services for its members and residents since October 1999 through a Management Agreement with Wandsworth Borough Council. The TMO has successfully passed through 3 Continuation Ballots (in 2004, 2009 and 2014) with high turnouts and strong tenant support.

  When the TMO first took over the management of the estate we took on the full range of services but subsequently returned service charge collection in 2003 and rent collection in 2005.

  The TMO has invested significant surplus funds and matched these against a number of successful Small Improvement Budget bids to develop a playground in Swanton Gardens, new estate lighting, a new car park at Eastwick Court, brought the previously derelict garages and storesheds on the estate back into use and undertaken a number of renewals to paths, access roads and the estate environment.
`;

const AboutPanel = () => {
  const { t } = useTranslation();

  return (
    <>
      <Heading title={t("about")} />
      <ContentPanel>
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
          {aboutContent}
        </ReactMarkdown>
      </ContentPanel>
    </>
  );
};

export default AboutPanel;
