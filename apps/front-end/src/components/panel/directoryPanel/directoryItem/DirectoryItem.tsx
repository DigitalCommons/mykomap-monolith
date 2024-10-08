import React from "react";
import ListItem from "@mui/material/ListItem";
interface DirectoryItemProps {
  id: string;
  name: string;
  link: string;
}

const DirectoryItem = ({id, name, link}: DirectoryItemProps) => {
  return <ListItem key={id}>{name}</ListItem>;
};

export default DirectoryItem;
