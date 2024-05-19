import { LegacyRef, SelectHTMLAttributes, forwardRef } from "react"
import { FieldError } from "react-hook-form"
import styles from './SelectInput.module.css'

type OptionProps = {
  value: number | string
  option: string
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    field: string
    options: OptionProps[]
    error?: FieldError
    hasPlaceholder: boolean
    placeholderMessage?: string
    onChangeHandler?: (event: React.ChangeEvent<HTMLSelectElement>) => void
  }

export const SelectInput = forwardRef(function SelectInput({field, options, defaultValue, error, hasPlaceholder, placeholderMessage, onChangeHandler, ...props}: SelectProps, ref: LegacyRef<HTMLSelectElement>){

    return (
        <div className={styles.selectContainer}>
            <label htmlFor={field}>{field}</label>
            <select id={field} ref={ref} {...props} defaultValue={defaultValue} onChange={onChangeHandler}>
                {hasPlaceholder ?
                (
                  <option className={styles.placeholderText}>{placeholderMessage}</option>
                ): null}
                {options.map(option => (
                  <option key={option.value} value={option.value}>{option.option}</option>
                ))}
            </select>
            <span>{error?.message ? error?.message : null}</span>
        </div>
      )
})

