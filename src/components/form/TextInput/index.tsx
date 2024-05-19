import { InputHTMLAttributes, LegacyRef, forwardRef } from "react"
import { FieldError } from "react-hook-form"
import styles from './TextInput.module.css'
import { Info } from "lucide-react"

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    field: string
    error?: FieldError
    hasInfo: boolean
    infoMessage?: string
  }

export const TextInput = forwardRef(function TextInput({type, field, error, hasInfo, infoMessage, ...props}: InputProps, ref: LegacyRef<HTMLInputElement>){

    return (
        <div className={styles.inputContainer}>
            <label htmlFor={field}>{field}</label>

            {hasInfo ? 
            (
              <div className={styles.info}><Info size={20}/>{infoMessage}</div>
            ) : null}
            
            <input type={type} id={field} ref={ref} {...props} />
            <span>{error?.message ? error?.message : null}</span>
        </div>
      )
})

