import { LegacyRef, TextareaHTMLAttributes, forwardRef } from "react"
import { FieldError } from "react-hook-form"
import styles from './Textarea.module.css'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
    field: string
    error?: FieldError
  }

export const Textarea = forwardRef(function Textarea({field, error, ...props}: TextareaProps, ref: LegacyRef<HTMLTextAreaElement>){

    return (
        <div className={styles.textareaContainer}>
            <label htmlFor={field}>{field}</label>
            <textarea id={field} ref={ref} {...props} />
            <span>{error?.message ? error?.message : null}</span>
        </div>
      )
})

