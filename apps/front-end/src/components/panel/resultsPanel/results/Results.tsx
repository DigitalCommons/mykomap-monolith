import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import { styled } from "@mui/material/styles";
import ResultItem from "./resultItem/ResultItem";

// Mock data
const results = [
  {
    id: "1",
    name: "Agricultores Federados Argentinos Sociedad Cooperativa Limitada (AFA S.C.L.)",
    link: "",
  },
  {
    id: "2",
    name: "Asociación de Cooperativas Argentinas Cooperativa Limitada (ACA C.L.)",
    link: "",
  },
  {
    id: "3",
    name: "Confederación Cooperativa de la República Argentina Ltda. (COOPERAR)",
    link: "",
  },
  {
    id: "4",
    name: "Cooperativa de Trabajos Portuarios Limitada de San Martin (Coop Portuaria)",
    link: "",
  },
  {
    id: "5",
    name: "Federación Argentina de Cooperativas de Consumo (FACC)",
    link: "",
  },
  {
    id: "6",
    name: "Instituto Movilizador De Fondos Cooperativos, Cooperativa Ltda. (IMFC)",
    link: "",
  },
  {
    id: "7",
    name: "La Segunda Cooperativa Limitada Seguros Generales",
    link: "",
  },
  { id: "8", name: "Sancor Cooperativa de Seguros Ltdae", link: "" },
];

const StyledResults = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  padding: "var(--spacing-medium) 0",
  maxWidth: "var(--panel-width-desktop)",
  margin: "0 auto",
  "@media (min-width: 768px)": {
    padding: "var(--spacing-xxlarge) 0 var(--spacing-large) 0",
  },
}));

const Results = () => {
  const resultCount = results.length;

  return (
    <StyledResults>
      <Typography
        variant="h4"
        component="h4"
        sx={{
          color: "var(--color-neutral-tint)",
          padding: "0 var(--spacing-medium)",
          "@media (min-width: 768px)": {
            marginBottom: "var(--spacing-large)",
            padding: "0 var(--spacing-large)",
          },
        }}
      >
        {resultCount} matching results
      </Typography>
      <List>
        {results.map((result) => (
          <ResultItem key={result.id} {...result} link={result.link} />
        ))}
      </List>
    </StyledResults>
  );
};

export default Results;
