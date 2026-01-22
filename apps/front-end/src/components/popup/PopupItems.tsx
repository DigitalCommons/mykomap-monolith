import { useTranslation } from "react-i18next";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { decode } from "html-entities";
import { styled } from "@mui/material/styles";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Link from "@mui/material/Link";
import { trackCustomDatasetEvent } from "../../services/analytics";
import { useAppSelector } from "../../app/hooks";
import { selectPopupId } from "./popupSlice";
import { ConfigPopupItem } from "../../services/types";

const removeHtmlTags = (text: string) =>
  decode(
    text.replace(/<[^<>]+(>)/g, ""), // remove HTML tags
  )?.trim();

const Text = ({
  itemConfig,
  text,
}: {
  itemConfig: ConfigPopupItem;
  text: string;
}) => {
  const { t } = useTranslation();

  if (!text) {
    return null;
  }

  return (
    <Box>
      {itemConfig.showLabel && (
        <Typography variant="h4">{t(itemConfig.itemProp)}</Typography>
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
  itemConfig,
  texts,
}: {
  itemConfig: ConfigPopupItem;
  texts: string[];
}) => {
  const { t } = useTranslation();

  if (!texts) {
    return null;
  }

  return (
    <>
      {itemConfig.showLabel && (
        <Typography variant="h4">{t(itemConfig.itemProp)}</Typography>
      )}
      {itemConfig.showBullets ? (
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

const Address = ({
  itemConfig,
  address,
}: {
  itemConfig: ConfigPopupItem;
  address: string;
}) => (
  <>
    {splitAddress(address).map((line, index) => (
      <Typography key={index}>{line}</Typography>
    ))}
  </>
);

const Hyperlink = ({
  itemConfig,
  url,
}: {
  itemConfig: ConfigPopupItem;
  url: string;
}) => {
  const fullUrl = `${itemConfig.hyperlinkBaseUri || ""}${url}`;

  const handleClick = () => {
    if (itemConfig.analyticOnClick) {
      const itemId = useAppSelector(selectPopupId);
      const capitalisedPropName =
        itemConfig.itemProp.charAt(0).toUpperCase() +
        itemConfig.itemProp.slice(1);

      trackCustomDatasetEvent(`Item_${capitalisedPropName}Click`, {
        item_id: itemId,
        url: fullUrl,
      });
    }
  };

  return (
    <Typography variant="body1">
      <Link
        href={fullUrl}
        target="_blank"
        rel="noreferrer"
        onClick={handleClick}
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
        {itemConfig.displayText || url}
      </Link>
    </Typography>
  );
};

const HyperlinkMultiple = ({
  itemConfig,
  urls,
}: {
  itemConfig: ConfigPopupItem;
  urls: string[];
}) => {
  const { t } = useTranslation();

  const MAX_DOMAIN_LENGTH = 25;
  const DOMAINS_SINGLE_COlUMN = itemConfig.singleColumnLimit || 10;

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

  const handleClick = (url: string) => {
    if (itemConfig.analyticOnClick) {
      const itemId = useAppSelector(selectPopupId);
      const capitalisedPropName =
        itemConfig.itemProp.charAt(0).toUpperCase() +
        itemConfig.itemProp.slice(1);

      trackCustomDatasetEvent(`Item_${capitalisedPropName}Click`, {
        item_id: itemId,
        url: `${itemConfig.hyperlinkBaseUri || ""}${url}`,
      });
    }
  };

  return (
    <>
      {itemConfig.showLabel && (
        <Typography variant="h4">{t(itemConfig.itemProp)}</Typography>
      )}
      <StyledDomainListsContainer>
        {urlCollections.map((urlCollection) => (
          <List key={urlCollection[0]}>
            {urlCollection?.map((url) => (
              <ListItem key={url}>
                <Typography variant="body1">
                  <Link
                    href={`${itemConfig.hyperlinkBaseUri || ""}${url}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => handleClick(url)}
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
  config: ConfigPopupItem[];
}) => {
  return config.map((itemConfig, i) => {
    if (itemConfig.valueStyle === "text") {
      if (itemConfig.multiple) {
        return (
          <TextMultiple
            itemConfig={itemConfig}
            texts={data[itemConfig.itemProp]}
            key={i}
          />
        );
      } else {
        return (
          <Text
            itemConfig={itemConfig}
            text={data[itemConfig.itemProp]}
            key={i}
          />
        );
      }
    }
    if (itemConfig.valueStyle === "address") {
      return (
        <Address
          itemConfig={itemConfig}
          address={data[itemConfig.itemProp]}
          key={i}
        />
      );
    }
    if (itemConfig.valueStyle === "hyperlink") {
      if (itemConfig.multiple) {
        return (
          <HyperlinkMultiple
            itemConfig={itemConfig}
            urls={data[itemConfig.itemProp]}
            key={i}
          />
        );
      } else {
        return (
          <Hyperlink
            itemConfig={itemConfig}
            url={data[itemConfig.itemProp]}
            key={i}
          />
        );
      }
    }
  });
};

export default PopupItems;
