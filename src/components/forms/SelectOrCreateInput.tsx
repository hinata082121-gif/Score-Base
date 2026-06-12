"use client";

const field = "min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

export type SelectOrCreateOption = {
  id: string;
  label: string;
  helper?: string;
};

export type SelectOrCreateValue = {
  mode: "none" | "existing" | "new";
  id?: string;
  label: string;
};

export function SelectOrCreateInput({
  label,
  help,
  options,
  value,
  onChange,
  allowNone = false,
  noneLabel = "なし",
  required = false,
  placeholder = "新規入力",
}: {
  label: string;
  help?: string;
  options: SelectOrCreateOption[];
  value: SelectOrCreateValue;
  onChange: (value: SelectOrCreateValue) => void;
  allowNone?: boolean;
  noneLabel?: string;
  required?: boolean;
  placeholder?: string;
}) {
  const hasOptions = options.length > 0;
  const selectValue = value.mode === "existing" ? `existing:${value.id ?? ""}` : value.mode;
  const showText = !hasOptions || value.mode === "new";

  return (
    <label className="space-y-1 text-sm font-bold text-stone-700">
      <span>{label}{required ? " 必須" : ""}</span>
      {hasOptions ? (
        <select
          className={field}
          value={selectValue}
          onChange={(event) => {
            const next = event.target.value;
            if (next === "none") return onChange({ mode: "none", label: "" });
            if (next === "new") return onChange({ mode: "new", label: value.mode === "new" ? value.label : "" });
            const id = next.replace("existing:", "");
            const option = options.find((item) => item.id === id);
            onChange({ mode: "existing", id, label: option?.label ?? "" });
          }}
        >
          {allowNone ? <option value="none">{noneLabel}</option> : null}
          {!allowNone && !required ? <option value="none">未選択</option> : null}
          {options.map((option) => <option key={option.id} value={`existing:${option.id}`}>{option.label}{option.helper ? ` / ${option.helper}` : ""}</option>)}
          <option value="new">新規入力</option>
        </select>
      ) : null}
      {showText ? (
        <input className={field} required={required && !allowNone} value={value.label} onChange={(event) => onChange({ mode: "new", label: event.target.value })} placeholder={placeholder} />
      ) : null}
      {help ? <span className="block text-xs font-bold text-stone-500">{help}</span> : null}
    </label>
  );
}
