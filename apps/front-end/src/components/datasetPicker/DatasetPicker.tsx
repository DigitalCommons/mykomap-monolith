import { useEffect, useState } from "react";
import { Box, Link, List, ListItem, Typography } from "@mui/material";
import { listDatasets } from "../../services";

interface DatasetEntry {
  id: string;
  label: string;
  submaps?: { key: string; title: string }[];
}

const buildHref = (id: string, submap?: string): string => {
  const params = new URLSearchParams(window.location.search);
  params.set("datasetId", id);
  if (submap) params.set("submap", submap);
  else params.delete("submap");
  return `?${params.toString()}`;
};

const DatasetPicker = () => {
  const [entries, setEntries] = useState<DatasetEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Mykomap";
    listDatasets()
      .then((response) => {
        if (response.status === 200) setEntries(response.body);
        else setError(`Server returned status ${response.status}`);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : String(e));
      });
  }, []);

  // List the datasets with their submaps in sub-lists below them
  return (
    <Box sx={{ maxWidth: 640, mx: "auto", p: 4 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "black", fontWeight: "bold" }}
      >
        Mykomaps
      </Typography>
      {error && (
        <Typography color="error">Failed to load datasets: {error}</Typography>
      )}
      {!error && entries === null && <Typography>Loading…</Typography>}
      {entries !== null && entries.length === 0 && (
        <Typography>No datasets are available on this server.</Typography>
      )}
      {entries !== null && entries.length > 0 && (
        <List sx={{ pl: 3, listStyleType: "disc" }}>
          {entries.map(({ id, label, submaps }) => (
            <ListItem key={id} disableGutters sx={{ display: "list-item" }}>
              <Link href={buildHref(id)} underline="hover">
                <Typography component="span">
                  {label}{" "}
                  <Typography component="span" color="text.secondary">
                    ({id})
                  </Typography>
                </Typography>
              </Link>
              {submaps && submaps.length > 0 && (
                <List
                  dense
                  disablePadding
                  sx={{ pl: 3, listStyleType: "circle" }}
                >
                  {submaps.map(({ key, title }) => (
                    <ListItem
                      key={key}
                      disableGutters
                      sx={{ display: "list-item", py: 0 }}
                    >
                      <Link href={buildHref(id, key)} underline="hover">
                        <Typography component="span">{title}</Typography>
                      </Link>
                    </ListItem>
                  ))}
                </List>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default DatasetPicker;
