import { ChangeEvent } from "react"

export function handlePhoneChange(e: ChangeEvent<HTMLInputElement>) {
    const formattedOnlyDigits = e.target.value.replace(/\D/g, '')

    const formattedWithDDSpace =
      formattedOnlyDigits.length > 2
        ? `${formattedOnlyDigits.slice(0, 2)} ${formattedOnlyDigits.slice(2)}`
        : formattedOnlyDigits

    const formattedWithHyphen = formattedWithDDSpace.length > 8
        ? `${formattedWithDDSpace.slice(0, 8)}-${formattedWithDDSpace.slice(8)}`
        : formattedWithDDSpace

    e.target.value = formattedWithHyphen
}