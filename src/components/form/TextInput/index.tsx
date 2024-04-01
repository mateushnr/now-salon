import { InputHTMLAttributes, LegacyRef, forwardRef } from "react"
import { FieldError } from "react-hook-form"
import styles from './TextInput.module.css'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    field: string
    error?: FieldError
  }

export const TextInput = forwardRef(function TextInput({type, field, error, ...props}: InputProps, ref: LegacyRef<HTMLInputElement>){

    return (
        <div className={styles.inputContainer}>
            <label htmlFor={field}>{field}</label>
            <input type={type} id={field} ref={ref} {...props} />
            <span>{error?.message ? error?.message : null}</span>
        </div>
      )
})

