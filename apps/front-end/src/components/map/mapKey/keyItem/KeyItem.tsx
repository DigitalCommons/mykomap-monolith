import React from "react";

interface KeyItemProps {
  icon?: string;
  label: string;
  colour?: string;
}

const KeyItem = ({ icon, label, colour }: KeyItemProps) => {
  return (
    <div>
      <span>{icon}</span>
      <span style={{ backgroundColor: colour }}>{label}</span>
    </div>
  );
};

export default KeyItem;
