export type AuthContextType = {
    isCustomerAuthenticated: boolean
    isEmployeeAuthenticated: boolean
    customer: Customer | null
    employee: Employee | null
    signInCustomer: (data:SignInCustomerData) => Promise<string | null>
    signInEmployee: (data:SignInEmployeeData) => Promise<string | null>
    logout: () => void
}

export type SignInCustomerData = {
    email: string;
    password: string;
}

export type SignInEmployeeData = {
    registration: string;
    password: string;
}

export type Customer = {
    name: string
    email: string
    phone: string
}

export type Employee = {
    name: string
    phone: string
    role: string
    accessLevel: string
}