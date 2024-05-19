import signupBarber from '@/../public/images/signupBarber.jpg'
import Image from 'next/image'
import styles from '@/styles/pages/SignUp.module.css'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { TextInput } from '@/components/form/TextInput'
import { handlePhoneChange } from '@/formatters/phone'
import { useContext, useState } from 'react'
import { BadgePlus, ShieldX } from 'lucide-react'
import { AuthContext, recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { parseCookies } from 'nookies'
import Head from 'next/head'
import { CustomerHeader } from '@/components/CustomerHeader'

const SignUpSchema = z.object({
    name: z
        .string()
        .min(1, 'Informe o seu nome'),
    email: z
        .string()
        .min(1, 'Informe um email')
        .refine((value) => {
        const regex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/
        return regex.test(value)
        }, 'Email inválido'),
    phone: z
        .string()
        .min(1, 'Informe o seu telefone')
        .min(13, 'Telefone incompleto'),
    password: z
        .string()
        .min(1, 'Informe a sua senha')
        .min(6, 'A senha deve ter no mínimo 6 caracteres')
  })

export type SignUpFormData = z.infer<typeof SignUpSchema>

type RegistrationStatus = {
    showMessage: boolean
    message: string
    occurredError: boolean
}

interface SignUpProps {
    isCustomerAuthenticated: boolean
}

export default function SignUp({isCustomerAuthenticated}: SignUpProps) {
    const router = useRouter()

    const { signInCustomer } = useContext(AuthContext)

    const { register, handleSubmit, formState } =
    useForm<SignUpFormData>({
      mode: 'onBlur',
      resolver: zodResolver(SignUpSchema),
    })

    const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus>({showMessage: false, message: '', occurredError: false})

    async function handleRegister(data: SignUpFormData){
        try {
            const response = await fetch(`http://localhost:8080/api-now-salon/customers/api`, {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data), 
            });

            switch (response.status){
                case 201:{
                    setRegistrationStatus({showMessage: true, message: 'Usuário cadastrado!', occurredError: false})
                    signInCustomer({email: data.email, password: data.password})

                    setTimeout(()=>{
                        router.push('/')
                    }, 2000)
                    break
                }
                case 409:{
                    setRegistrationStatus({showMessage: true, message: 'Email já cadastrado, por favor insira um novo email', occurredError: true})
                    break
                }
                default: {
                    setRegistrationStatus({showMessage: true, message: 'Ocorreu algum erro durante o cadastro', occurredError: true})
                }
            }
          } catch (error) {
            setRegistrationStatus({showMessage: true, message: `Erro ocorrido durante cadastro: ${error}`, occurredError: true})
          }
    }
   
  return (
    <>
        <Head>
            <title>Cadastre-se</title>
        </Head>

        <CustomerHeader isCustomerAuthenticated={isCustomerAuthenticated}/>

        <main className={styles.container}>
        <Image 
            priority={true}
            className={styles.signUpImage}
            src={signupBarber}
            width={418}
            height={670}
            alt="Imagem de um barbeiro"
        />

            <form  onSubmit={handleSubmit(handleRegister)} id="signup" className={styles.formContainer}>
                <div className={styles.formHeader}>
                    <h1 className={styles.title}>Crie sua conta <span className={styles.detailTitle}/></h1>
                    
                    <p>São poucos passos, mas é necessário para validarmos quem está agendando nossos serviços</p>
                </div>
                
                <div className={styles.formBody}>
                    <TextInput
                        type="text"
                        field="Nome"
                        {...register('name')}
                        error={formState.errors.name}
                        hasInfo={false}
                    />
                    <TextInput
                        type="text"
                        field="Email"
                        {...register('email')}
                        error={formState.errors.email}
                        hasInfo={false}
                    /> 
                    <TextInput
                        type="tel"
                        field="Telefone"
                        maxLength={13}
                        {...register('phone', {onChange: handlePhoneChange})}
                        error={formState.errors.phone}
                        hasInfo={false}
                    />
                    <TextInput
                        type="password"
                        field="Senha"
                        {...register('password')}
                        error={formState.errors.password}
                        hasInfo={false}
                    />
                </div>
                
                <button className={styles.signUpButton} type="submit"> Cadastrar-se </button>

                {registrationStatus.showMessage 
                ?(
                    <div className={styles.registrationStatus}>
                        {
                        registrationStatus.occurredError 
                        ? <ShieldX color="#D14242" size={32}/>
                        : <BadgePlus color="#5ad142" size={32}/>}
                        
                        {registrationStatus.showMessage ? registrationStatus.message : null}
                    </div>
                ) 
                : null}
            </form>    
        </main>
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