import {
  supportedLanguages,
  type SupportedLanguage,
} from "../../models/language.model";

interface Props {
  value: SupportedLanguage;
  onChange: (language: SupportedLanguage) => void;
}

export function LanguageSelector({ value, onChange }: Props) {
  return (
    <label className="field compact-field">
      <span>Language</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as SupportedLanguage)}
      >
        {supportedLanguages.map((language) => (
          <option key={language.value} value={language.value}>
            {language.label}
          </option>
        ))}
      </select>
    </label>
  );
}
