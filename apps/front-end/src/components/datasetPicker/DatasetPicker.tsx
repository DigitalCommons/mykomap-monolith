import { useEffect, useState } from "react";
import { Box, Link, List, ListItem, Typography } from "@mui/material";
import { listDatasets } from "../../services";

interface DatasetEntry {
  id: string;
  label: string;
}

const buildHref = (id: string): string => {
  const params = new URLSearchParams(window.location.search);
  params.set("datasetId", id);
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

  return (
    <Box sx={{ maxWidth: 640, mx: "auto", p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom
                  sx={{ color: "black", fontWeight: "bold" }}>
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
        <List>
          {entries.map(({ id, label }) => (
            <ListItem key={id} disableGutters>
              <Link href={buildHref(id)} underline="hover">
                <Typography component="span">
                  {label} <Typography component="span" color="text.secondary">({id})</Typography>
                </Typography>
              </Link>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default DatasetPicker;
