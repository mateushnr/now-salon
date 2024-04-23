import { ChangeEvent } from "react"

export function handleEmployeeRegistrationChange(e: ChangeEvent<HTMLInputElement>) {
    const formattedOnlyDigits = e.target.value.replace(/\D/g, '')

    e.target.value = formattedOnlyDigits
}