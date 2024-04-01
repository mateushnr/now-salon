import { createContext, useEffect, useState } from 'react'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { AuthContextType, Customer, Employee, SignInCustomerData, SignInEmployeeData } from '@/@types/auth';
import { useRouter } from 'next/router';

const BASE_URL = 'http://localhost:8080/api-now-salon'

export const recoverCustomerAuthData = async (token: string) => {
  try {
    const response = await fetch(`${BASE_URL}/customers/api/auth`, {
      method: 'POST', 
      headers: { 'Content-Type': 'text/plain' },
      body: token, 
    });

    if (response.ok) {
      const customerData = await response.json();
      return customerData
    }else{
      throw new Error('Falha na autenticação');
    }
  } catch (error) {
    console.error('Falha na autenticação: ', error);
  }

  return null
}

export const recoverEmployeeAuthData = async (token: string) => {
  try {
    const response = await fetch(`${BASE_URL}/employees/api/auth`, {
      method: 'POST', 
      headers: { 'Content-Type': 'text/plain' },
      body: token, 
    });

    if (response.ok) {
      const employeeData = await response.json();
    
      return employeeData
    }else{
      throw new Error('Falha na autenticação');
    }
  } catch (error) {
    console.error('Falha na autenticação: ', error);
  }

  return null
}

export const AuthContext = createContext({} as AuthContextType)

export function AuthProvider({ children }: {children: React.ReactNode}){
    const [customer, setCustomer] = useState<Customer | null>(null)
    const [employee, setEmployee] = useState<Employee | null>(null)

    const isCustomerAuthenticated = !!customer;
    const isEmployeeAuthenticated = !!employee;

    const router = useRouter()

    const authenticateCustomer = async (token: string) => {
      const customerData = await recoverCustomerAuthData(token)
      setCustomer(customerData);
    }

    const authenticateEmployee = async (token: string) => {
      const employeeData = await recoverEmployeeAuthData(token)
      setEmployee(employeeData);
    }

    useEffect(()=>{
      const {'nowsalon.customer-token': tokenCustomer, 'nowsalon.employee-token': tokenEmployee} = parseCookies()

      if (tokenCustomer){
        authenticateCustomer(tokenCustomer)
      }

      if(tokenEmployee){
        authenticateEmployee(tokenEmployee)
      }
    }, [])

    function logout(){
      destroyCookie(undefined, 'nowsalon.customer-token')
      destroyCookie(undefined, 'nowsalon.employee-token')
      
      setCustomer(null)
      setEmployee(null)
      router.push("/")
    }

    async function signInCustomer (data: SignInCustomerData){
        try {
            const response = await fetch(`${BASE_URL}/customers/api/login`, {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data), 
            });
      
            switch(response.status){
              case 200:{
                const customerData = await response.json();
                setCookie(undefined, 'nowsalon.customer-token', customerData.idToken, {
                  maxAge: 60 * 60 * 3,
                });
                
                setCustomer({name: customerData.name, email: customerData.email, phone: customerData.phone});

                return null
              }
              default:{
                return 'O login falhou! Por favor confira sua senha ou o seu email.';
              }
            }
      
          } catch (error) {
            return 'Ocorreu algum erro inesperado no login: ' + error ;
          }
    }

    async function signInEmployee (data: SignInEmployeeData){
      try {
          const response = await fetch(`${BASE_URL}/employees/api/login`, {
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({...data, registration: Number(data.registration)}), 
          });
    
          switch(response.status){
            case 200:{
              const employeeData = await response.json();
              setCookie(undefined, 'nowsalon.employee-token', employeeData.idToken, {
                maxAge: 60 * 60 * 5,
              });
              
              setEmployee({name: employeeData.name, phone: employeeData.phone, role: employeeData.role, accessLevel: employeeData.accessLevel});

              return null
            }
            default:{
              return 'O login falhou! Confira sua matrícula ou senha';
            }
          }
    
        } catch (error) {
          return 'Ocorreu algum erro inesperado no login: ' + error ;
        }
  }

    return (
        <AuthContext.Provider value={{isCustomerAuthenticated, isEmployeeAuthenticated, customer, employee, signInCustomer, signInEmployee, logout }}>
            {children}
        </AuthContext.Provider>
    )
}