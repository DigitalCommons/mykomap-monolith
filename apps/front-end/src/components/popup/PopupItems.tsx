import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { decode } from "html-entities";
import { type PopupItem } from "../../app/configSlice";
import { styled } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Link from "@mui/material/Link";

const removeHtmlTags = (text: string) =>
  decode(
    text.replace(/<[^<>]+(>)/g, ""), // remove HTML tags
  )?.trim();

const Text = ({ item, text }: { item: PopupItem; text: string }) => {
  const { t } = useTranslation();

  if (!text) {
    return null;
  }

  return (
    <Box>
      {item.showLabel && (
        <Typography variant="h4">{t(item.itemProp)}</Typography>
      )}
      <Typography
        sx={{
          marginBottom: "var(--spacing-medium)",
          fontWeight: "var(--font-weight-medium)",
        }}
        variant="body1"
      >
        {removeHtmlTags(text)}
      </Typography>
    </Box>
  );
};

const TextMultiple = ({
  item,
  texts,
}: {
  item: PopupItem;
  texts: string[];
}) => {
  const { t } = useTranslation();

  if (!texts) {
    return null;
  }

  return (
    <>
      {item.showLabel && (
        <Typography variant="h4">{t(item.itemProp)}</Typography>
      )}
      {item.showBullets ? (
        <List>
          {texts.map((text) => (
            <ListItem
              key={text}
              sx={{
                display: "list-item",
                marginLeft: "var(--spacing-medium)",
              }}
            >
              {text}
            </ListItem>
          ))}
        </List>
      ) : (
        texts.map((text) => (
          <Typography variant="h4">{removeHtmlTags(text)}</Typography>
        ))
      )}
    </>
  );
};

const splitAddress = (address?: string): string[] => {
  if (!address) return [];
  return address.split(",").map((line) => line.trim());
};

const Address = ({ item, address }: { item: PopupItem; address: string }) => (
  <>
    {splitAddress(address).map((line, index) => (
      <Typography key={index}>{line}</Typography>
    ))}
  </>
);

const Hyperlink = ({ item, url }: { item: PopupItem; url: string }) => (
  <Typography variant="body1">
    <Link
      href={`${item.hyperlinkBaseUri || ""}${url}`}
      target="_blank"
      rel="noreferrer"
      sx={{
        color: "#ffffffB3",
        textDecoration: "underline",
        padding: "0 !important",
        fontSize: "var(--font-size-xsmall)",
        overflowX: "hidden",
        textOverflow: "ellipsis",
        marginTop: "var(--spacing-small)",
      }}
    >
      {item.displayText || url}
    </Link>
  </Typography>
);

const HyperlinkMultiple = ({
  item,
  urls,
}: {
  item: PopupItem;
  urls: string[];
}) => {
  const { t } = useTranslation();

  const MAX_DOMAIN_LENGTH = 25;
  const DOMAINS_SINGLE_COlUMN = item.singleColumnLimit || 10;

  if (urls.length === 0) return null;

  const StyledDomainListsContainer = styled(Box)(() => ({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  }));

  //split into 2 columns if more than single column limit and there's room to render
  const urlCollections =
    urls.length > DOMAINS_SINGLE_COlUMN && window.innerWidth >= 400
      ? [
          urls.slice(0, Math.ceil(urls.length / 2)),
          urls.slice(Math.ceil(urls.length / 2)),
        ]
      : [urls];

  return (
    <>
      {item.showLabel && (
        <Typography variant="h4">{t(item.itemProp)}</Typography>
      )}
      <StyledDomainListsContainer>
        {urlCollections.map((urlCollection) => (
          <List key={urlCollection[0]}>
            {urlCollection?.map((url) => (
              <ListItem key={url}>
                <Typography variant="body1">
                  <Link
                    href={`${item.hyperlinkBaseUri || ""}${url}`}
                    target="_blank"
                    rel="noreferrer"
                    sx={{
                      color: "var(--color-text)",
                      textDecoration: "underline",
                      padding: "0 !important",
                      fontSize: "var(--font-size-xsmall)",
                    }}
                  >
                    {url.length > MAX_DOMAIN_LENGTH &&
                    url.length > DOMAINS_SINGLE_COlUMN
                      ? url.slice(0, MAX_DOMAIN_LENGTH - 5) + "(...)"
                      : url}
                  </Link>
                </Typography>
              </ListItem>
            ))}
          </List>
        ))}
      </StyledDomainListsContainer>
    </>
  );
};

const PopupItems = ({
  data,
  config,
}: {
  data: { [key: string]: any };
  config: PopupItem[];
}) => {
  return config.map((item) => {
    if (item.valueStyle === "text") {
      if (item.multiple) {
        return <TextMultiple item={item} texts={data[item.itemProp]} />;
      } else {
        return <Text item={item} text={data[item.itemProp]} />;
      }
    }
    if (item.valueStyle === "address") {
      return <Address item={item} address={data[item.itemProp]} />;
    }
    if (item.valueStyle === "hyperlink") {
      if (item.multiple) {
        return <HyperlinkMultiple item={item} urls={data[item.itemProp]} />;
      } else {
        return <Hyperlink item={item} url={data[item.itemProp]} />;
      }
    }
  });
};

export default PopupItems;
