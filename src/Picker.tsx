import { useState } from 'react';
import {
  Autocomplete, Button, Input, ListBox, ListBoxItem, Popover,
  SearchField, Select, useFilter,
} from 'react-aria-components';

export type Choice = { id: string; title: string; detail?: string; flag?: string };

function Chevron() {
  return <svg className="picker-chevron" width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export default function Picker({ label, value, choices, onChange, searchable = false, country = false }: {
  label: string; value: string; choices: Choice[]; onChange: (id: string) => void;
  searchable?: boolean; country?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = choices.find(item => item.id === value);
  const { contains } = useFilter({ sensitivity: 'base' });
  const list = <ListBox className="picker-list" items={choices} renderEmptyState={() => <p className="picker-empty">Nenhum resultado. Tente outro nome.</p>}>
    {item => <ListBoxItem id={item.id} textValue={item.title} className="picker-option">
      {({ isSelected }) => <>
        {item.flag && <span className="option-flag" aria-hidden="true">{item.flag}</span>}
        <span className="option-copy"><span>{item.title}</span>{item.detail && <small>{item.detail}</small>}</span>
        <span className="option-check" aria-hidden="true">{isSelected ? '✓' : ''}</span>
      </>}
    </ListBoxItem>}
  </ListBox>;

  return <Select isOpen={isOpen} onOpenChange={setIsOpen} aria-label={label} selectedKey={value} onSelectionChange={key => { if (key !== null) onChange(String(key)); }} className={`picker ${country ? 'picker-country' : 'picker-compact'}`}>
    <Button className="picker-trigger" aria-label={`${label}: ${selected?.title ?? ''}`}>
      {selected?.flag && <span className="picker-flag" aria-hidden="true">{selected.flag}</span>}
      <span className="picker-value">{selected?.title}</span>
      {country && <span className="picker-action">Trocar</span>}
      <Chevron/>
    </Button>
    <Popover className={`picker-popover ${country ? 'country-popover' : ''}`} offset={8} placement="bottom start" containerPadding={18}>
      {searchable ? <Autocomplete filter={contains}>
        <SearchField autoFocus aria-label={`Buscar em ${label.toLowerCase()}`} className="picker-search">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <Input onKeyDownCapture={event => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setIsOpen(false); } }} placeholder={country ? 'Busque um país…' : 'Busque uma edição…'}/>
          <Button className="picker-clear" aria-label="Limpar busca">×</Button>
        </SearchField>
        <div className="picker-list-heading">{country ? 'ESCOLHA SEU DESTINO' : 'EDIÇÕES DISPONÍVEIS'}</div>
        {list}
      </Autocomplete> : list}
    </Popover>
  </Select>;
}
