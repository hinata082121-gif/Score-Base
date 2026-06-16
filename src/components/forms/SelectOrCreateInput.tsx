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
  allowCreate = true,
  noneLabel = "なし",
  emptyLabel = "未選択",
  required = false,
  optional = false,
  error,
  disabled = false,
  placeholder = "新規入力",
}: {
  label: string;
  help?: string;
  options: SelectOrCreateOption[];
  value: SelectOrCreateValue;
  onChange: (value: SelectOrCreateValue) => void;
  allowNone?: boolean;
  allowCreate?: boolean;
  noneLabel?: string;
  emptyLabel?: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  const hasOptions = options.length > 0;
  const selectValue = value.mode === "existing" ? `existing:${value.id ?? ""}` : !allowCreate && value.mode === "new" ? "none" : value.mode;
  const showText = allowCreate && (!hasOptions || value.mode === "new");
  const describedBy = error ? `${label}-error` : help ? `${label}-help` : undefined;

  return (
    <label className="space-y-1 text-sm font-bold text-stone-700">
      <span className="flex items-center gap-2">
        <span>{label}</span>
        {required ? <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-black text-red-700">必須</span> : null}
        {optional ? <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-black text-stone-500">任意</span> : null}
      </span>
      {hasOptions ? (
        <select
          className={`${field} ${error ? "border-red-400 bg-red-50" : ""}`}
          value={selectValue}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
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
          {!allowNone && (!required || optional) ? <option value="none">{emptyLabel}</option> : null}
          {options.map((option) => <option key={option.id} value={`existing:${option.id}`}>{option.label}{option.helper ? ` / ${option.helper}` : ""}</option>)}
          {allowCreate ? <option value="new">新規入力</option> : null}
        </select>
      ) : null}
      {showText ? (
        <input className={`${field} ${error ? "border-red-400 bg-red-50" : ""}`} disabled={disabled} required={required && !allowNone} aria-invalid={Boolean(error)} aria-describedby={describedBy} value={value.label} onChange={(event) => onChange({ mode: "new", label: event.target.value })} placeholder={placeholder} />
      ) : null}
      {help ? <span id={`${label}-help`} className="block text-xs font-bold text-stone-500">{help}</span> : null}
      {error ? <span id={`${label}-error`} className="block text-xs font-black text-red-700">{error}</span> : null}
    </label>
  );
}
