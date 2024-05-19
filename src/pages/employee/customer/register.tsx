import { recoverCustomerAuthData, recoverEmployeeAuthData } from '@/contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import Head from 'next/head';

import styles from '@/styles/pages/Customer.module.css'
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput } from '@/components/form/TextInput';
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { handlePhoneChange } from '@/formatters/phone';

const CustomerSchema = z.object({
    name: z
        .string()
        .min(1, 'Informe o nome'),
    email: z
        .string()
        .min(1, 'Informe um email')
        .refine((value) => {
        const regex = /^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/
        return regex.test(value)
        }, 'Email inválido'),
    phone: z
        .string()
        .min(1, 'Informe o telefone')
        .min(13, 'Telefone incompleto'),
    password: z
        .string()
        .min(1, 'Informe a senha')
        .min(6, 'A senha deve ter no mínimo 6 caracteres')
  })

export type CustomerFormData = z.infer<typeof CustomerSchema>

interface CustomerProps {
    employeeAccessLevel: string
}

export default function CreateCustomer({employeeAccessLevel}: CustomerProps) {
    const { register, handleSubmit, formState, setValue, getValues } =
    useForm<CustomerFormData>({
      mode: 'onBlur',
      resolver: zodResolver(CustomerSchema),
    })

    const [successRegistration, setSuccessRegistration] = useState<boolean>(false)

    const router = useRouter()

    async function handleCreateCustomer(data: CustomerFormData){
        try {
            const response = await fetch('http://localhost:8080/api-now-salon/customers/api', {
              method: 'POST', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data), 
            });

            switch (response.status){
                case 201:{
                    setTimeout(()=>{
                        router.reload()
                    }, 2000)

                    setSuccessRegistration(true)
                    break
                }
                default: {
                    alert("Erro no cadastro de cliente")
                }
            }
          } catch (error) {
            alert("Erro no cadastro de cleinte: " + error)
          }
    }

    return (
        <>
        <Head>
            <title>Gerenciar clientes</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Criar novo cliente</h1>
                <Link href="/employee/customer" className={styles.listButton}>Visualizar clientes</Link>
            </header>
            
            <span className={styles.separatorDetail}/>
       
            <form onSubmit={handleSubmit(handleCreateCustomer)} className={styles.formContainer}>
                <section className={styles.sectionData}>
                    <strong>Dados do cliente</strong>
                    
                    <div className={styles.fieldsData}>
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

                    <button className={styles.createButton} type="submit">Cadastrar cliente</button>

                    {successRegistration ? (<span className={styles.successMessage}>Cadastrado com sucesso!</span>) : null}
                </section>
            </form>  
        </main>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const {'nowsalon.customer-token': tokenCustomer, 'nowsalon.employee-token': tokenEmployee} = parseCookies(context)

    const customer = await recoverCustomerAuthData(tokenCustomer)
    const employee = await recoverEmployeeAuthData(tokenEmployee)

    if(customer != null || employee == null || employee.accessLevel != "Admin"){
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }else {
        return {
            props: {
                employeeAccessLevel: employee.accessLevel,
            }
        }
    }
}
