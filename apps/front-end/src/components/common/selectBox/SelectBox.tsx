import React, { useState } from "react";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import type { SelectChangeEvent } from "@mui/material";

interface OptionProps {
  value: string;
  label: string;
}

interface SelectBoxProps {
  label: string;
  value: string;
  onChange: (event: SelectChangeEvent<string>, child: React.ReactNode) => void;
  id: string;
  options?: OptionProps[];
}

const SelectBox = ({
  label,
  id,
  value,
  options,
  onChange,
  ...props
}: SelectBoxProps) => {
  const [open, setOpen] = useState(false); // To manage open state

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box>
      <InputLabel id={id}>{label}</InputLabel>
      <Select
        value={value}
        onChange={onChange}
        labelId={id}
        displayEmpty
        renderValue={(selected) => {
          return selected && selected !== "" ? (
            options?.find((option) => option.value === selected)?.label || ""
          ) : (
            <>Please select an option</>
          );
        }}
        aria-labelledby={id}
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        role="combobox"
        onOpen={handleOpen}
        onClose={handleClose}
        MenuProps={{
          id: `${id}-menu`,
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "left",
          },
        }}
        {...props}
      >
        {options?.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            role="option"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default SelectBox;
