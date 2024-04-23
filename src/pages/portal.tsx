import { AuthContext, recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext';
import { CustomerHeader } from '@/components/CustomerHeader';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';
import { Footer } from '@/components/Footer';

import styles from '@/styles/pages/Portal.module.css'
import { TextInput } from '@/components/form/TextInput';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { handleEmployeeRegistrationChange } from '@/formatters/employeeRegistration';
import { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import { LightGrayBodyGlobalStyle } from '@/styles/BodyGlobalStyle';

interface PortalProps {
  isCustomerAuthenticated: boolean
}

type StatusEmployeeLogin = {
    failed: boolean
    errorMessage: string | null
  }

const LoginEmployeeSchema = z.object({
    registration: z
      .string()
      .min(1, 'Informe sua matrícula')
      .min(4, 'Matrícula inválida'),
    password: z.string().min(1, 'Informe a sua senha').min(6, 'A senha tem no mínimo 6 caracteres')
  })

export type LoginEmployeeFormData = z.infer<typeof LoginEmployeeSchema>

export default function Portal({isCustomerAuthenticated}: PortalProps) {
    const {register, handleSubmit, formState} = useForm<LoginEmployeeFormData>({
        mode: 'onSubmit',
        resolver: zodResolver(LoginEmployeeSchema)
    })

    const { signInEmployee } = useContext(AuthContext)

    const router = useRouter()

    const [loginEmployeeStatus, setLoginEmployeeStatus] = useState<StatusEmployeeLogin>({failed: false, errorMessage: null})

    async function handleEmployeeLoginSubmit(data: LoginEmployeeFormData){
        const msgStatusLogin = await signInEmployee(data)

        if(msgStatusLogin !== null){
          setLoginEmployeeStatus({failed: true, errorMessage: msgStatusLogin})
        }else{
          setLoginEmployeeStatus({failed: false, errorMessage: null})
          router.push('/employee')
        }
    }

    return (
        <>
        <Head>
            <title>Portal funcionários</title>
            <style>{LightGrayBodyGlobalStyle}</style>
        </Head>
        <CustomerHeader isCustomerAuthenticated={isCustomerAuthenticated}/>
        <main className={styles.container}>
            <form onSubmit={handleSubmit(handleEmployeeLoginSubmit)} className={styles.formPortalContainer}>
                <h1 className={styles.titlePortal}>Portal Funcionários</h1>
                <div className={styles.portalInputsContainer}>
                    <TextInput 
                        type='text' 
                        field="Matricula" 
                        {...register('registration', {onChange: handleEmployeeRegistrationChange})} 
                        error={formState.errors.registration}
                        maxLength={4}
                    />
                    <TextInput 
                        type='password' 
                        field="Senha" 
                        {...register('password')} 
                        error={formState.errors.password}
                    />
                </div>
                <button className={styles.btnLoginEmployee} type='submit'>Acessar sistema</button>

                {loginEmployeeStatus.failed
                ?(<p className={styles.errorMessageLogin}>{loginEmployeeStatus.errorMessage}</p>)
                : null
                }
            </form>
        </main>
        <Footer/>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const {'nowsalon.customer-token': tokenCustomer, 'nowsalon.employee-token': tokenEmployee} = parseCookies(context)

    let isCustomerAuthenticated = false
    let isEmployeeAuthenticated = false

    const customer = await recoverCustomerAuthData(tokenCustomer)
    const employee = await recoverEmployeeAuthData(tokenEmployee)

    if(customer != null){
        isCustomerAuthenticated = true
    }

    if(employee != null){
        isEmployeeAuthenticated = true
    }

    if (isCustomerAuthenticated){
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }else if(isEmployeeAuthenticated){
        return {
            redirect: {
                destination: '/employee',
                permanent: false,
            }
        }
    }
  
    return {
        props: {
            isCustomerAuthenticated,
        }
    }
}
