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
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Customer } from '@/@types/customer';
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
        .union([z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'), z.string().length(0)]).optional(),
  })

export type CustomerFormData = z.infer<typeof CustomerSchema>

interface CustomerProps {
    employeeAccessLevel: string
    customerDataToEdit: Customer
}

export default function EditCustomer({employeeAccessLevel, customerDataToEdit}: CustomerProps) {
    const { register, handleSubmit, formState, setValue } =
    useForm<CustomerFormData>({
      mode: 'onBlur',
      resolver: zodResolver(CustomerSchema),
    })

    useEffect(()=>{
        if(customerDataToEdit !== null){
            setValue('name', customerDataToEdit.name)
            setValue('email', customerDataToEdit.email)
            setValue('phone', customerDataToEdit.phone)
        }
    },[setValue, customerDataToEdit])

    const router = useRouter()

    async function handleEditCustomer(data: CustomerFormData){
        if (!data.password) {
            delete data.password;
        }

        try {
            const response = await fetch(`http://localhost:8080/api-now-salon/customers/api/?id=${router.query.id}`, {
              method: 'PUT', 
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data), 
            });

            switch (response.status){
                case 200:{
                    setTimeout(()=>{
                        router.push(`/employee/customer`)
                    }, 1000)
                    break
                }
                default: {
                    alert("Erro na edição de cliente")
                }
            }
          } catch (error) {
            alert("Erro na edição de cliente: " + error)
          }
    }

    return (
        <>
        <Head>
            <title>Editar cliente</title>
        </Head>
        <EmployeeHeader employeeAccessLevel={employeeAccessLevel}/>
        <main className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.pageTitle}>Editando cliente</h1>
                <Link href="/employee/customer" className={styles.deleteButton}>Cancelar</Link>
            </header>
        
            <span className={styles.separatorDetail}/>

            {customerDataToEdit !== null ? (
            <form onSubmit={handleSubmit(handleEditCustomer)} className={styles.formContainer}>
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
                            hasInfo={true}
                            infoMessage='Deixar a senha em branco mantém a senha atual'
                        />
                    </div>

                    <button className={styles.listButton} type="submit">Confirmar e editar cliente</button>
                </section>
            </form> ): (
                <strong className={styles.itemNotFoundTitle}>Cliente não encontrado</strong>
            )}
        </main>
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const {'nowsalon.customer-token': tokenCustomer, 'nowsalon.employee-token': tokenEmployee} = parseCookies(context)

    const customer = await recoverCustomerAuthData(tokenCustomer)
    const employee = await recoverEmployeeAuthData(tokenEmployee)

    const routeParams = context.params;

    let customerDataToEdit = null

    if(routeParams !== undefined){
        try {
            const response = await fetch(`http://localhost:8080/api-now-salon/customers/api/?id=${routeParams.id}`, {
            });
        
            if (response.ok) {
                customerDataToEdit = await response.json();
            }else{
              throw new Error('Falha em recuperar dados do cliente em edição');
            }
        } catch (error) {
            console.error('Falha em recuperar dados do cliente em edição: ', error);
        }
    }
    
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
                customerDataToEdit,
            }
        }
    }
}
