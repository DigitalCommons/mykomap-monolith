import React, { useState } from "react";
import { Select, InputLabel, Box, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

interface OptionProps {
  value: string;
  label: string;
}

interface SelectBoxProps {
  label: string;
  value: string;
  onChange: (event: SelectChangeEvent<string>, child: React.ReactNode) => void;
  id?: string;
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
  const useId = () => {
    return Math.random().toString(16).slice(2);
  };

  const autoGeneratedId = useId();
  const selectId = id || autoGeneratedId;
  const [open, setOpen] = useState(false); // To manage open state

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box>
      <InputLabel id={selectId}>{label}</InputLabel>
      <Select
        value={value}
        onChange={onChange}
        labelId={selectId}
        aria-labelledby={selectId}
        aria-expanded={open}
        aria-controls={`${selectId}-menu`}
        role="combobox"
        onOpen={handleOpen}
        onClose={handleClose}
        MenuProps={{
          id: `${selectId}-menu`,
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
          <MenuItem key={option.value} value={option.value} role="option">
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default SelectBox;
