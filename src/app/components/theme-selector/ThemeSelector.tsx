import { themes, type ThemeId } from "../../models/theme.model";

interface Props {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export function ThemeSelector({ value, onChange }: Props) {
  return (
    <label className="field compact-field">
      <span>Theme</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ThemeId)}
      >
        {themes.map((theme) => (
          <option key={theme.value} value={theme.value}>
            {theme.label}
          </option>
        ))}
      </select>
    </label>
  );
}
