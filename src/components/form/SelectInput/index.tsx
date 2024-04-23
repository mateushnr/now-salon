import { InputHTMLAttributes, LegacyRef, SelectHTMLAttributes, forwardRef } from "react"
import { FieldError } from "react-hook-form"
import styles from './SelectInput.module.css'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
    field: string
    options: string[]
    error?: FieldError
  }

export const SelectInput = forwardRef(function SelectInput({field, options, defaultValue, error, ...props}: SelectProps, ref: LegacyRef<HTMLSelectElement>){

    return (
        <div className={styles.selectContainer}>
            <label htmlFor={field}>{field}</label>
            <select id={field} ref={ref} {...props} defaultValue={defaultValue}>
                {options.map(optValue => (
                  <option key={optValue} value={optValue}>{optValue}</option>
                ))}
            </select>
            <span>{error?.message ? error?.message : null}</span>
        </div>
      )
})

