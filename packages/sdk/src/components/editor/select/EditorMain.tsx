import { Plus } from '@teable/icons';
import { Command, CommandInput, CommandItem, cn } from '@teable/ui-lib';
import type { ForwardRefRenderFunction } from 'react';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import type { ISelectOption } from '../../cell-value';
import type { ICellEditor, IEditorRef } from '../type';
import { OptionList } from './components';

export type ISelectValue<T extends boolean> = T extends true ? string[] : string;

export interface ISelectEditorMain<T extends boolean> extends ICellEditor<ISelectValue<T>> {
  options?: ISelectOption[];
  isMultiple?: T;
  style?: React.CSSProperties;
  className?: string;
  onOptionAdd?: (name: string) => Promise<void>;
}

const getValue = (value?: string | string[]) => {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

const SelectEditorMainBase: ForwardRefRenderFunction<
  IEditorRef<string | string[] | undefined>,
  ISelectEditorMain<boolean>
> = (props, ref) => {
  const {
    value: originValue,
    options = [],
    isMultiple,
    style,
    className,
    onChange,
    onOptionAdd,
  } = props;

  const [value, setValue] = useState<string[]>(getValue(originValue));
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      setSearchValue('');
      inputRef.current?.focus();
    },
    setValue: (value?: string | string[]) => {
      setValue(getValue(value));
    },
  }));

  const filteredOptions = useMemo(() => {
    if (!searchValue) return options;

    return options.filter((v) => v.label.toLowerCase().includes(searchValue.toLowerCase()));
  }, [options, searchValue]);

  const onSelect = (val: string) => {
    setSearchValue('');
    if (isMultiple) {
      const newValue = value.includes(val) ? value.filter((v) => v !== val) : value.concat(val);
      return onChange?.(newValue);
    }
    onChange?.(val === value[0] ? undefined : val);
  };

  const checkIsActive = useCallback(
    (v: string) => {
      return isMultiple ? value.includes(v) : value[0] === v;
    },
    [isMultiple, value]
  );

  const onOptionAddInner = async () => {
    if (!searchValue) return;
    setSearchValue('');
    await onOptionAdd?.(searchValue);
    if (isMultiple) {
      const newValue = value.concat(searchValue);
      setValue(newValue);
      return onChange?.(newValue);
    }
    setValue([searchValue]);
    onChange?.(searchValue);
  };

  const optionAddable =
    searchValue && filteredOptions.findIndex((v) => v.value === searchValue) === -1;

  return (
    <Command className={className} style={style} shouldFilter={false}>
      <CommandInput
        ref={inputRef}
        placeholder="Search option"
        value={searchValue}
        onValueChange={(value) => setSearchValue(value)}
        onKeyDown={async (e) => {
          if (e.key === 'Enter' && filteredOptions.length === 0) {
            e.stopPropagation();
            await onOptionAddInner();
          }
        }}
      />
      <OptionList options={filteredOptions} onSelect={onSelect} checkIsActive={checkIsActive} />
      {(filteredOptions.length === 0 || optionAddable) && (
        <CommandItem
          className={cn('items-center justify-center', !optionAddable && 'opacity-0 h-0 p-0')}
          onSelect={onOptionAddInner}
        >
          <Plus className="size-4 shrink-0" />
          <span className="ml-2 truncate">{`Add an option '${searchValue}'`}</span>
        </CommandItem>
      )}
    </Command>
  );
};

export const SelectEditorMain = forwardRef(SelectEditorMainBase);
